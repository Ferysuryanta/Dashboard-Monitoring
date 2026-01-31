package com.mamregbkp.dto;

import java.time.LocalDate;
import java.util.UUID;

public class BibleReadingDto {
    private Long id;
    private UUID memberId;
    private String memberName;
    private LocalDate readingDate;
    private String bookName;
    private Integer chapter;
    private Integer verseStart;
    private Integer verseEnd;
    private Boolean completed;
    private String notes;

    public BibleReadingDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }

    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }

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
