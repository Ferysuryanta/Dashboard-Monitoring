package com.mamregbkp.controller;

import com.mamregbkp.dto.FinanceTransactionDto;
import com.mamregbkp.model.FinanceTransaction;
import com.mamregbkp.service.FinanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService service;

    public FinanceController(FinanceService service) {
        this.service = service;
    }

    @PostMapping("/transactions")
    public ResponseEntity<FinanceTransaction> createTransaction(@RequestBody FinanceTransactionDto dto) {
        // TODO: replace createdBy with authenticated user id
        FinanceTransaction created = service.createTransaction(dto, null);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<FinanceTransactionDto>> listTransactions(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        if (from == null) from = LocalDate.now().minusMonths(1);
        if (to == null) to = LocalDate.now();
        return ResponseEntity.ok(service.listTransactions(from, to));
    }

    @GetMapping("/reports/monthly")
    public ResponseEntity<Map<String, Object>> monthlyReport(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(service.monthlyReport(month, year));
    }
}
