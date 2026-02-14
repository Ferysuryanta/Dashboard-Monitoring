package com.mamregbkp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FinanceTransactionDto {
    private Long id;
    private String txnType;
    private BigDecimal amount;
    private LocalDate txnDate;
    private Long sectorId;
    private String category;
    private String description;
    private String reference;
}
