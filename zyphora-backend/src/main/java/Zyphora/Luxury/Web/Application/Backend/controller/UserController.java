package Zyphora.Luxury.Web.Application.Backend.controller;

import Zyphora.Luxury.Web.Application.Backend.dto.request.UpdateProfileRequest;
import Zyphora.Luxury.Web.Application.Backend.dto.response.DeletionScheduleResponse;
import Zyphora.Luxury.Web.Application.Backend.dto.response.UserResponse;
import Zyphora.Luxury.Web.Application.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getCurrentUser() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse response = userService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        UserResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/account")
    public ResponseEntity<DeletionScheduleResponse> scheduleAccountDeletion() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        DeletionScheduleResponse response = userService.scheduleAccountDeletion(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/password")
    public ResponseEntity<UserResponse> updatePassword(@RequestBody Map<String, String> passwordData) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String currentPassword = passwordData.get("current");
        String newPassword = passwordData.get("new");
        UserResponse response = userService.updatePassword(userId, currentPassword, newPassword);
        return ResponseEntity.ok(response);
    }
}