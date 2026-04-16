package Zyphora.Luxury.Web.Application.Backend.scheduler;

import Zyphora.Luxury.Web.Application.Backend.model.User;
import Zyphora.Luxury.Web.Application.Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AccountDeletionScheduler {

    @Autowired
    private UserRepository userRepository;

    @Scheduled(cron = "0 0 2 * * ?") // Run at 2 AM every day
    @Transactional
    public void deleteScheduledAccounts() {
        LocalDateTime now = LocalDateTime.now();
        List<User> usersToDelete = userRepository.findAll().stream()
                .filter(user -> user.getDeletionScheduledAt() != null)
                .filter(user -> user.getDeletionScheduledAt().isBefore(now))
                .toList();

        for (User user : usersToDelete) {
            userRepository.delete(user);
        }

        System.out.println("Deleted " + usersToDelete.size() + " scheduled accounts");
    }
}