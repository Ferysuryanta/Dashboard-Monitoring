package com.mamregbkp.service;

import com.mamregbkp.dto.FinanceTransactionDto;
import com.mamregbkp.model.FinanceTransaction;
import com.mamregbkp.repository.FinanceTransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinanceService {

    private final FinanceTransactionRepository repository;

    public FinanceService(FinanceTransactionRepository repository) {
        this.repository = repository;
    }

    public FinanceTransaction createTransaction(FinanceTransactionDto dto, Long createdBy) {
        FinanceTransaction ft = new FinanceTransaction();
        ft.setTxnType(dto.getTxnType());
        ft.setAmount(dto.getAmount());
        ft.setTxnDate(dto.getTxnDate());
        ft.setSectorId(dto.getSectorId());
        ft.setCategory(dto.getCategory());
        ft.setDescription(dto.getDescription());
        ft.setReference(dto.getReference());
        ft.setCreatedBy(createdBy);
        return repository.save(ft);
    }

    public List<FinanceTransactionDto> listTransactions(LocalDate from, LocalDate to) {
        List<FinanceTransaction> list = repository.findByTxnDateBetween(from, to);
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    public Map<String, Object> monthlyReport(int month, int year) {
        // naive implementation: get date range and aggregate per sector
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to = from.withDayOfMonth(from.lengthOfMonth());
        List<FinanceTransaction> txns = repository.findByTxnDateBetween(from, to);

        BigDecimal totalIncome = txns.stream()
                .filter(t -> "INCOME".equalsIgnoreCase(t.getTxnType()))
                .map(FinanceTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpense = txns.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getTxnType()))
                .map(FinanceTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, Map<String, BigDecimal>> perSector = new HashMap<>();

        txns.forEach(t -> {
            Long s = t.getSectorId() == null ? 0L : t.getSectorId();
            perSector.putIfAbsent(s, new HashMap<>());
            Map<String, BigDecimal> agg = perSector.get(s);
            agg.putIfAbsent("income", BigDecimal.ZERO);
            agg.putIfAbsent("expense", BigDecimal.ZERO);
            if ("INCOME".equalsIgnoreCase(t.getTxnType())) {
                agg.put("income", agg.get("income").add(t.getAmount()));
            } else {
                agg.put("expense", agg.get("expense").add(t.getAmount()));
            }
        });

        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("totalIncome", totalIncome);
        result.put("totalExpense", totalExpense);
        result.put("net", totalIncome.subtract(totalExpense));
        result.put("perSector", perSector);
        return result;
    }

    private FinanceTransactionDto toDto(FinanceTransaction ft) {
        FinanceTransactionDto dto = new FinanceTransactionDto();
        dto.setId(ft.getId());
        dto.setTxnType(ft.getTxnType());
        dto.setAmount(ft.getAmount());
        dto.setTxnDate(ft.getTxnDate());
        dto.setSectorId(ft.getSectorId());
        dto.setCategory(ft.getCategory());
        dto.setDescription(ft.getDescription());
        dto.setReference(ft.getReference());
        return dto;
    }
}
