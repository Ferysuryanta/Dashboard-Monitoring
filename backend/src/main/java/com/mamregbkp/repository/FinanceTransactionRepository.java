package com.mamregbkp.repository;

import com.mamregbkp.model.FinanceTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface FinanceTransactionRepository extends JpaRepository<FinanceTransaction, Long> {

    List<FinanceTransaction> findByTxnDateBetween(LocalDate from, LocalDate to);

    @Query("SELECT ft FROM FinanceTransaction ft WHERE ft.sectorId = :sectorId AND ft.txnDate BETWEEN :from AND :to")
    List<FinanceTransaction> findBySectorAndDateRange(@Param("sectorId") Long sectorId, @Param("from") LocalDate from, @Param("to") LocalDate to);

}
