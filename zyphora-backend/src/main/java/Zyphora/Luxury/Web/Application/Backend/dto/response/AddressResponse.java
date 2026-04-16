package Zyphora.Luxury.Web.Application.Backend.dto.response;

import lombok.Data;

@Data
public class AddressResponse {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}