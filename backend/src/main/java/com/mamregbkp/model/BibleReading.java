package com.mamregbkp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "bible_reading")
public class BibleReading {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", insertable = false, updatable = false)
    private Member member;

    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @Column(name = "book_name")
    private String bookName;  // Nama kitab (e.g., "Kejadian", "Keluaran")

    @Column(name = "chapter")
    private Integer chapter;  // Pasal

    @Column(name = "verse_start")
    private Integer verseStart;  // Ayat awal

    @Column(name = "verse_end")
    private Integer verseEnd;  // Ayat akhir

    @Column(name = "completed")
    private Boolean completed = false;

    @Column(name = "notes")
    private String notes;


}
