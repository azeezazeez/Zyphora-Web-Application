package Zyphora.Luxury.Web.Application.Backend.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String image;
    private Double rating;
    private Integer stockQuantity;
    private String brand;
    private String size;
    private String color;
    private boolean available;
}