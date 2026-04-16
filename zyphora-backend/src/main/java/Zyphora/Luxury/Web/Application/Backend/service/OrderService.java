package Zyphora.Luxury.Web.Application.Backend.service;

import Zyphora.Luxury.Web.Application.Backend.dto.request.OrderRequest;
import Zyphora.Luxury.Web.Application.Backend.dto.response.OrderResponse;
import Zyphora.Luxury.Web.Application.Backend.model.*;
import Zyphora.Luxury.Web.Application.Backend.repository.OrderRepository;
import Zyphora.Luxury.Web.Application.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    // Get current user's orders
    public List<OrderResponse> getUserOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get all orders (for admin)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Admin orders (alias for getAllOrders)
    public List<OrderResponse> adminOrder() {
        return getAllOrders();
    }

    // Place order
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        // Get current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setUser(user);
        order.setTotal(request.getTotal() != null ? request.getTotal() : BigDecimal.ZERO);
        order.setSubtotal(request.getSubtotal() != null ? request.getSubtotal() : BigDecimal.ZERO);
        order.setTax(request.getTax() != null ? request.getTax() : BigDecimal.ZERO);
        order.setShippingCost(request.getShippingCost() != null ? request.getShippingCost() : BigDecimal.ZERO);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PROCESSING);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);
        return convertToResponse(savedOrder);
    }

    // Update order status (for admin)
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        order.setUpdatedAt(LocalDateTime.now());

        Order updatedOrder = orderRepository.save(order);
        return convertToResponse(updatedOrder);
    }

    // Convert Order entity to OrderResponse DTO
    private OrderResponse convertToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setTotal(order.getTotal());
        response.setStatus(order.getStatus() != null ? order.getStatus().name() : "PROCESSING");
        response.setCreatedAt(order.getCreatedAt());
        response.setSubtotal(order.getSubtotal());
        response.setTax(order.getTax());
        response.setShippingCost(order.getShippingCost());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setTrackingNumber(order.getTrackingNumber());

        if (order.getUser() != null) {
            response.setCustomerName(order.getUser().getName());
            response.setCustomerEmail(order.getUser().getEmail());
            response.setUserId(order.getUser().getId());
        }

        // Safe address mapping
        if (order.getAddress() != null) {
            AddressResponse addressResponse = new AddressResponse();
            Address address = order.getAddress();

            addressResponse.setStreet(address.getStreet() != null ? address.getStreet() : "");
            addressResponse.setCity(address.getCity() != null ? address.getCity() : "");
            addressResponse.setState(address.getState() != null ? address.getState() : "");
            addressResponse.setZipCode(address.getZipCode() != null ? address.getZipCode() : "");
            addressResponse.setCountry(address.getCountry() != null ? address.getCountry() : "");

            response.setAddress(addressResponse);
        }

        return response;
    }
}