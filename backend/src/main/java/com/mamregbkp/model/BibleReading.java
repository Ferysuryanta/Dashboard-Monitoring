package com.mamregbkp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "bible_reading")
public class BibleReading {

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

    // Constructors
    public BibleReading() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public LocalDate getReadingDate() { return readingDate; }
    public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }

    public String getBookName() { return bookName; }
    public void setBookName(String bookName) { this.bookName = bookName; }

    public Integer getChapter() { return chapter; }
    public void setChapter(Integer chapter) { this.chapter = chapter; }

    public Integer getVerseStart() { return verseStart; }
    public void setVerseStart(Integer verseStart) { this.verseStart = verseStart; }

    public Integer getVerseEnd() { return verseEnd; }
    public void setVerseEnd(Integer verseEnd) { this.verseEnd = verseEnd; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
