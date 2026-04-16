package Zyphora.Luxury.Web.Application.Backend.service;

import Zyphora.Luxury.Web.Application.Backend.dto.request.LoginRequest;
import Zyphora.Luxury.Web.Application.Backend.dto.request.RegisterRequest;
import Zyphora.Luxury.Web.Application.Backend.dto.request.UpdateProfileRequest;
import Zyphora.Luxury.Web.Application.Backend.dto.response.AuthResponse;
import Zyphora.Luxury.Web.Application.Backend.dto.response.DeletionScheduleResponse;
import Zyphora.Luxury.Web.Application.Backend.dto.response.UserResponse;
import Zyphora.Luxury.Web.Application.Backend.exception.ResourceNotFoundException;
import Zyphora.Luxury.Web.Application.Backend.model.User;
import Zyphora.Luxury.Web.Application.Backend.model.Role;
import Zyphora.Luxury.Web.Application.Backend.repository.UserRepository;
import Zyphora.Luxury.Web.Application.Backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${user.mail}")
    private String fromEmail;

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, Long> otpExpiry = new ConcurrentHashMap<>();

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateToken(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                token
        );
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println("=== LOGIN ATTEMPT ===");
        System.out.println("Email: " + request.getEmail());
        System.out.println("Password: " + request.getPassword());

        try {
            // First check if user exists
            User user = userRepository.findByEmail(request.getEmail())
                    .orElse(null);

            if (user == null) {
                System.out.println("User not found with email: " + request.getEmail());
                throw new RuntimeException("User not found");
            }

            System.out.println("User found: " + user.getEmail());
            System.out.println("User active: " + user.isActive());
            System.out.println("User role: " + user.getRole());

            // Authenticate
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            System.out.println("Authentication successful");

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = tokenProvider.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            System.out.println("Token generated successfully");

            return new AuthResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole(),
                    token
            );
        } catch (Exception e) {
            System.err.println("Login failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Invalid email or password");
        }
    }

    public UserResponse getUserProfile(String userId) {
        Long id = Long.parseLong(userId);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToResponse(user);
    }

    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        Long id = Long.parseLong(userId);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry());
        }
        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    @Transactional
    public UserResponse updatePassword(String userId, String currentPassword, String newPassword) {
        Long id = Long.parseLong(userId);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    // Update this method to not return OTP
    public void generateAndSendOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found"));

        String otp = String.format("%06d", new Random().nextInt(999999));

        otpStorage.put(email, otp);
        otpExpiry.put(email, System.currentTimeMillis() + 300000);

        // Send email via Brevo
        sendOTPEmail(email, otp);

        // Also print to console for testing
        System.out.println("========================================");
        System.out.println("OTP for " + email + ": " + otp);
        System.out.println("This OTP is valid for 5 minutes");
        System.out.println("========================================");
    }

    private void sendOTPEmail(String toEmail, String otp) {
        try {
            String url = "https://api.brevo.com/v3/smtp/email";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            String htmlContent = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<style>" +
                    "body { font-family: 'Inter', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }" +
                    ".container { max-width: 500px; margin: 50px auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }" +
                    ".logo { text-align: center; font-size: 28px; font-weight: bold; color: #1a1a1a; margin-bottom: 30px; letter-spacing: 2px; font-family: 'Georgia', serif; }" +
                    ".title { text-align: center; font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px; }" +
                    ".otp-code { font-size: 42px; font-weight: bold; text-align: center; color: #1a1a1a; letter-spacing: 8px; margin: 30px 0; padding: 20px 10px; background: #f5f5f5; border-radius: 12px; font-family: monospace; word-break: keep-all; white-space: nowrap; overflow-x: auto; }" +
                    ".message { text-align: center; color: #666; margin: 20px 0; line-height: 1.6; }" +
                    ".footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }" +
                    "</style>" +
                    "</head>" +
                    "<body>" +
                    "<div class='container'>" +
                    "<div class='logo'>ZYPHORA LUXURY</div>" +
                    "<div class='title'>Password Reset Request</div>" +
                    "<p class='message'>You requested to reset your password. Use the following OTP code to complete the process:</p>" +
                    "<div class='otp-code'>" + otp + "</div>" +
                    "<p class='message'>This OTP is valid for <strong>5 minutes</strong>.</p>" +
                    "<p class='message'>If you didn't request this, please ignore this email.</p>" +
                    "<div class='footer'>© 2026 Zyphora Luxury. All rights reserved.</div>" +
                    "</div>" +
                    "</body>" +
                    "</html>";

            String textContent = "Your Zyphora OTP for password reset is: " + otp + ". Valid for 5 minutes.";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("sender", Map.of("name", "Zyphora Luxury", "email", fromEmail));
            requestBody.put("to", List.of(Map.of("email", toEmail)));
            requestBody.put("subject", "Zyphora Luxury - Password Reset OTP");
            requestBody.put("htmlContent", htmlContent);
            requestBody.put("textContent", textContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.postForObject(url, entity, String.class);

            System.out.println("OTP email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public boolean verifyOTP(String email, String otp) {
        String storedOtp = otpStorage.get(email);
        Long expiry = otpExpiry.get(email);

        if (storedOtp == null || expiry == null) {
            return false;
        }

        if (System.currentTimeMillis() > expiry) {
            otpStorage.remove(email);
            otpExpiry.remove(email);
            return false;
        }

        return storedOtp.equals(otp);
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        otpStorage.remove(email);
        otpExpiry.remove(email);
    }

    @Transactional
    public DeletionScheduleResponse scheduleAccountDeletion(String userId) {
        Long id = Long.parseLong(userId);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDateTime deletionDate = LocalDateTime.now().plusDays(7);
        user.setDeletionScheduledAt(deletionDate);
        user.setActive(false);
        userRepository.save(user);

        return new DeletionScheduleResponse(
                "Account scheduled for deletion in 7 days",
                deletionDate
        );
    }

    public User getCurrentUser(String userId) {
        Long id = Long.parseLong(userId);
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private UserResponse convertToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setCity(user.getCity());
        response.setCountry(user.getCountry());
        response.setAvatar(user.getAvatar());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}