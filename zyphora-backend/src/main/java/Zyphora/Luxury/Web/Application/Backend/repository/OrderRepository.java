package Zyphora.Luxury.Web.Application.Backend.repository;

import Zyphora.Luxury.Web.Application.Backend.model.Order;
import Zyphora.Luxury.Web.Application.Backend.model.OrderStatus;
import Zyphora.Luxury.Web.Application.Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find orders by User object, ordered by creation date descending
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    // Find orders by User ID, ordered by creation date descending
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Find orders by User ID (without sorting)
    List<Order> findByUserId(Long userId);

    // Find all orders ordered by creation date descending (for admin)
    List<Order> findAllByOrderByCreatedAtDesc();

    // Find orders by status
    List<Order> findByStatus(OrderStatus status);

    // Count orders by user
    long countByUserId(Long userId);

    // Find recent orders (last 7 days)
    List<Order> findByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}