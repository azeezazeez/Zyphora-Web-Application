package Zyphora.Luxury.Web.Application.Backend.dto.request;

public class UpdateProfileRequest {

    private String name;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String avatar;

    // Getters
    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public String getAvatar() {
        return avatar;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}