package com.mamregbkp.service;

import com.mamregbkp.dto.FinanceTransactionDto;
import com.mamregbkp.model.FinanceTransaction;
import com.mamregbkp.repository.FinanceTransactionRepository;
import com.mamregbkp.repository.SectorRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinanceService {

    private final FinanceTransactionRepository repository;
    private final SectorRepository sectorRepository;

    public FinanceService(FinanceTransactionRepository repository, SectorRepository sectorRepository) {
        this.repository = repository;
        this.sectorRepository = sectorRepository;
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

        Map<Long, Map<String, BigDecimal>> perSector = new LinkedHashMap<>();

        txns.forEach(t -> {
            Long sectorId = t.getSectorId() == null ? 0L : t.getSectorId();
            perSector.putIfAbsent(sectorId, new HashMap<>());
            Map<String, BigDecimal> agg = perSector.get(sectorId);
            agg.putIfAbsent("income", BigDecimal.ZERO);
            agg.putIfAbsent("expense", BigDecimal.ZERO);
            if ("INCOME".equalsIgnoreCase(t.getTxnType())) {
                agg.put("income", agg.get("income").add(t.getAmount()));
            } else {
                agg.put("expense", agg.get("expense").add(t.getAmount()));
            }
        });

        List<Map<String, Object>> perSectorRows = perSector.entrySet().stream()
                .map(entry -> {
                    Long sectorId = entry.getKey();
                    Map<String, BigDecimal> agg = entry.getValue();
                    BigDecimal income = agg.getOrDefault("income", BigDecimal.ZERO);
                    BigDecimal expense = agg.getOrDefault("expense", BigDecimal.ZERO);
                    BigDecimal net = income.subtract(expense);

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("sectorId", sectorId == 0L ? null : sectorId);
                    row.put("sectorName", resolveSectorName(sectorId));
                    row.put("income", income);
                    row.put("expense", expense);
                    row.put("net", net);
                    return row;
                })
                .sorted(Comparator.comparing(row -> String.valueOf(row.get("sectorName")), String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toCollection(ArrayList::new));

        Map<String, Object> result = new HashMap<>();
        result.put("month", month);
        result.put("year", year);
        result.put("totalIncome", totalIncome);
        result.put("totalExpense", totalExpense);
        result.put("net", totalIncome.subtract(totalExpense));
        result.put("perSector", perSectorRows);
        return result;
    }

    private String resolveSectorName(Long sectorId) {
        if (sectorId == null || sectorId == 0L) {
            return "General";
        }
        return sectorRepository.findById(sectorId)
                .map(com.mamregbkp.model.Sector::getName)
                .filter(name -> !name.isBlank())
                .orElse("Sektor " + sectorId);
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
