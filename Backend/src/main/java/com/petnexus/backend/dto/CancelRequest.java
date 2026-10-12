package com.petnexus.backend.dto;


import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelRequest {
    @Size(max = 500, message = "Cancellation reason cannot be longer than 500 characters")
    private String cancellationReason;
}
