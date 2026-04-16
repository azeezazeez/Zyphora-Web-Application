package Zyphora.Luxury.Web.Application.Backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderRequest {
    private BigDecimal total;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal shippingCost;
    private String paymentMethod;
    private AddressRequest address;
    private List<OrderItemRequest> items;
}