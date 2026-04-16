package Zyphora.Luxury.Web.Application.Backend.controller;

import Zyphora.Luxury.Web.Application.Backend.dto.request.NewsletterRequest;
import Zyphora.Luxury.Web.Application.Backend.dto.response.MessageResponse;
import Zyphora.Luxury.Web.Application.Backend.model.NewsletterSubscriber;
import Zyphora.Luxury.Web.Application.Backend.service.NewsletterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    @Autowired
    private NewsletterService newsletterService;

    @PostMapping("/subscribe")
    public ResponseEntity<MessageResponse> subscribe(@Valid @RequestBody NewsletterRequest request) {
        MessageResponse response = newsletterService.subscribe(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/subscribers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NewsletterSubscriber>> getAllSubscribers() {
        List<NewsletterSubscriber> subscribers = newsletterService.getAllSubscribers();
        return ResponseEntity.ok(subscribers);
    }
}