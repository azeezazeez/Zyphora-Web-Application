package Zyphora.Luxury.Web.Application.Backend.controller;

import Zyphora.Luxury.Web.Application.Backend.dto.response.ProductResponse;
import Zyphora.Luxury.Web.Application.Backend.model.Product;
import Zyphora.Luxury.Web.Application.Backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    /**
     * GET /api/products - Fetch all products with optional filters
     * Access: Public
     */
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        try {
            System.out.println("=== GET /api/products ===");
            System.out.println("Filters - Category: " + category + ", Search: " + search);

            List<Product> products;

            if (category != null && !category.isEmpty()) {
                products = productService.findByCategory(category);
            } else if (search != null && !search.isEmpty()) {
                products = productService.searchProducts(search);
            } else {
                products = productService.findAll();
            }

            List<ProductResponse> responses = products.stream()
                    .map(this::convertToResponse)
                    .collect(Collectors.toList());

            System.out.println("Returning " + responses.size() + " products");
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            System.err.println("Error fetching products: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/products/{id} - Fetch a single product by ID
     * Access: Public
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            System.out.println("=== GET /api/products/" + id + " ===");

            if (id == null || id <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid product ID");
                return ResponseEntity.badRequest().body(error);
            }

            Product product = productService.findById(id);

            if (product == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Product not found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            System.out.println("Product found: " + product.getName());
            return ResponseEntity.ok(convertToResponse(product));
        } catch (Exception e) {
            System.err.println("Error fetching product " + id + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * GET /api/products/categories - Fetch all unique category names
     * Access: Public
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        try {
            System.out.println("=== GET /api/products/categories ===");
            List<String> categories = productService.findAllCategories();
            System.out.println("Returning " + categories.size() + " categories");
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            System.err.println("Error fetching categories: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/products - Add a new product (CREATE)
     * Access: Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addProduct(@Valid @RequestBody Product product) {
        try {
            System.out.println("=== POST /api/products - ADD PRODUCT ===");
            System.out.println("Product details:");
            System.out.println("  Name: " + product.getName());
            System.out.println("  Description: " + product.getDescription());
            System.out.println("  Price: " + product.getPrice());
            System.out.println("  Category: " + product.getCategory());
            System.out.println("  Image: " + product.getImage());
            System.out.println("  Stock Quantity: " + product.getStockQuantity());
            System.out.println("  Rating: " + product.getRating());
            System.out.println("  Brand: " + product.getBrand());
            System.out.println("  Size: " + product.getSize());
            System.out.println("  Color: " + product.getColor());
            System.out.println("  Available: " + product.isAvailable());

            // Validate required fields
            if (product.getName() == null || product.getName().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Product name is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (product.getPrice() == null || product.getPrice().doubleValue() <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Valid price is required (must be greater than 0)");
                return ResponseEntity.badRequest().body(error);
            }

            if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Category is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Set default values if not provided
            if (product.getStockQuantity() == null) {
                product.setStockQuantity(0);
            }
            if (product.getRating() == null) {
                product.setRating(0.0);
            }

            // Save the product
            Product savedProduct = productService.save(product);

            System.out.println("✅ Product added successfully with ID: " + savedProduct.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product added successfully");
            response.put("product", convertToResponse(savedProduct));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error adding product: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error adding product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * PUT /api/products/{id} - Full update of product
     * Access: Admin only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProductFull(@PathVariable Long id, @Valid @RequestBody Product product) {
        try {
            System.out.println("=== PUT /api/products/" + id + " - FULL UPDATE ===");

            if (id == null || id <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid product ID");
                return ResponseEntity.badRequest().body(error);
            }

            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Product not found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            product.setId(id);
            Product updatedProduct = productService.update(product);
            System.out.println("✅ Product fully updated successfully: " + updatedProduct.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product updated successfully");
            response.put("product", convertToResponse(updatedProduct));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error updating product " + id + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * PATCH /api/products/{id} - Partial update of product
     * Access: Admin only
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateProductPartial(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            System.out.println("=== PATCH /api/products/" + id + " - PARTIAL UPDATE ===");
            System.out.println("Updates: " + updates);

            if (id == null || id <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid product ID");
                return ResponseEntity.badRequest().body(error);
            }

            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Product not found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            // Apply partial updates
            if (updates.containsKey("name")) {
                existingProduct.setName((String) updates.get("name"));
            }
            if (updates.containsKey("description")) {
                existingProduct.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("price")) {
                existingProduct.setPrice(new BigDecimal(updates.get("price").toString()));
            }
            if (updates.containsKey("category")) {
                existingProduct.setCategory((String) updates.get("category"));
            }
            if (updates.containsKey("image")) {
                existingProduct.setImage((String) updates.get("image"));
            }
            if (updates.containsKey("stockQuantity")) {
                existingProduct.setStockQuantity((Integer) updates.get("stockQuantity"));
            }
            if (updates.containsKey("rating")) {
                existingProduct.setRating((Double) updates.get("rating"));
            }
            if (updates.containsKey("brand")) {
                existingProduct.setBrand((String) updates.get("brand"));
            }
            if (updates.containsKey("size")) {
                existingProduct.setSize((String) updates.get("size"));
            }
            if (updates.containsKey("color")) {
                existingProduct.setColor((String) updates.get("color"));
            }
            if (updates.containsKey("available")) {
                existingProduct.setAvailable((Boolean) updates.get("available"));
            }

            Product updatedProduct = productService.save(existingProduct);
            System.out.println("✅ Product partially updated successfully: " + updatedProduct.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Product updated successfully");
            response.put("product", convertToResponse(updatedProduct));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error updating product " + id + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error updating product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * DELETE /api/products/{id} - Delete a product
     * Access: Admin only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            System.out.println("=== DELETE /api/products/" + id + " ===");

            if (id == null || id <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Invalid product ID");
                return ResponseEntity.badRequest().body(error);
            }

            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Product not found with id: " + id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            productService.deleteById(id);
            System.out.println("✅ Product deleted successfully with ID: " + id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Product deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error deleting product " + id + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error deleting product: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Convert Product entity to ProductResponse DTO
     */
    private ProductResponse convertToResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setCategory(product.getCategory());
        response.setImage(product.getImage());
        response.setRating(product.getRating() != null ? product.getRating() : 0.0);
        response.setStockQuantity(product.getStockQuantity() != null ? product.getStockQuantity() : 0);
        response.setBrand(product.getBrand());
        response.setSize(product.getSize());
        response.setColor(product.getColor());
        response.setAvailable(product.isAvailable());
        return response;
    }
}