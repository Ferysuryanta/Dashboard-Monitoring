package com.mamregbkp.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dashboard-summary")
@Data
@NoArgsConstructor
public class DashboardSummary {

    @Id
    private String id;
    private long totalMembers;
    private long activeMembers;
    private long sectors;
    private long positions;

}
