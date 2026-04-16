package Zyphora.Luxury.Web.Application.Backend.dto.response;

import Zyphora.Luxury.Web.Application.Backend.model.AddressResponse;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private BigDecimal total;  // Changed from totalAmount to total
    private String status;
    private LocalDateTime createdAt;
    private String customerName;
    private String customerEmail;
    private Long userId;
    private List<OrderItemResponse> items;  // Optional: add order items
    private AddressResponse address;        // Optional: add address
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private String trackingNumber;
}