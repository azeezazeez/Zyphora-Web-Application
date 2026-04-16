package Zyphora.Luxury.Web.Application.Backend.service;

import Zyphora.Luxury.Web.Application.Backend.dto.request.NewsletterRequest;
import Zyphora.Luxury.Web.Application.Backend.dto.response.MessageResponse;
import Zyphora.Luxury.Web.Application.Backend.model.NewsletterSubscriber;
import Zyphora.Luxury.Web.Application.Backend.repository.NewsletterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NewsletterService {

    @Autowired
    private NewsletterRepository newsletterRepository;

    public MessageResponse subscribe(NewsletterRequest request) {
        // Check if email already exists
        if (newsletterRepository.existsByEmail(request.getEmail())) {
            return new MessageResponse("Email already subscribed");
        }

        // Create new subscriber
        NewsletterSubscriber subscriber = new NewsletterSubscriber();
        subscriber.setEmail(request.getEmail());  // This line requires setEmail method
        // subscribedAt will be set automatically by @PrePersist

        newsletterRepository.save(subscriber);

        return new MessageResponse("Subscribed successfully");
    }

    public List<NewsletterSubscriber> getAllSubscribers() {
        return newsletterRepository.findAll();
    }
}