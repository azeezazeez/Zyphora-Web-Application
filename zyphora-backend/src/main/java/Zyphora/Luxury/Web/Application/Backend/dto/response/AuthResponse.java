package Zyphora.Luxury.Web.Application.Backend.dto.response;

import Zyphora.Luxury.Web.Application.Backend.model.Role;

public class AuthResponse {

    private Long id;  // Change from String to Long
    private String name;
    private String email;
    private Role role;
    private String token;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String name, String email, Role role, String token) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    // Getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public String getToken() { return token; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRole(Role role) { this.role = role; }
    public void setToken(String token) { this.token = token; }
}