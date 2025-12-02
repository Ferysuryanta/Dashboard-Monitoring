package com.mamregbkp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "member")
@Data
@NoArgsConstructor
@EntityListeners(Member.AuditListener.class)
public class Member {
    @Id
    @Column(name = "id", columnDefinition = "uuid")
    private UUID id = UUID.randomUUID();

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "gender")
    private String gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id")
    private Sector sector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "position_id")
    private Position position;

    @Column(name = "status")
    private String status = "ACTIVE";

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attendance> attendances;

    public static class AuditListener {
        @PrePersist
        public void prePersist(Member m) {
            if (m.getCreatedAt() == null) m.setCreatedAt(OffsetDateTime.now());
            m.setUpdatedAt(OffsetDateTime.now());
        }

        @PreUpdate
        public void preUpdate(Member m) {
            m.setUpdatedAt(OffsetDateTime.now());
        }
    }
}
