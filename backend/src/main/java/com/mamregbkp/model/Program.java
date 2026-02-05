package com.mamregbkp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "program")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String type;
    private String status;

    // new fields for extended program table
    private String place;
    @Column(columnDefinition = "TEXT")
    private String purpose;

    private Integer targetPhysical;

    private Long budgetLocal;
    private Long budgetSubsidy;
    private Long budgetTotal;

    private String executor;
    private String scheduleText;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private String category;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

}
