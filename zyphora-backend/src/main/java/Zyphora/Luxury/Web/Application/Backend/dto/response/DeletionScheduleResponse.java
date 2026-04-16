package Zyphora.Luxury.Web.Application.Backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DeletionScheduleResponse {
    private String message;
    private LocalDateTime deletionScheduledAt;
}