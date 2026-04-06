package com.mamregbkp.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.seed.bible-feb2026", name = "enabled", havingValue = "true")
public class DataSeederRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeederRunner.class);

    private final JdbcTemplate jdbc;

    @Value("${app.seed.bible-feb2026.enabled:${SEED_BIBLE_FEB2026:false}}")
    private boolean seedFlag;

    @Value("${app.seed.bible-feb2026.percent:${SEED_PERCENT:30}}")
    private int seedPercent;

    public DataSeederRunner(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!seedFlag) {
            logger.info("DataSeederRunner: SEED_BIBLE_FEB2026 not enabled. Skipping seeding.");
            return;
        }

        logger.info("DataSeederRunner: Starting seeding bible_reading and attendance entries for Feb 2026 (seedPercent={})...", seedPercent);

        String[] sectors = {"Cimanggu", "Salabenda", "Semplak", "Sukadame", "Yasmin"};

        for (String sectorName : sectors) {
            try {
                // count active members in sector
                Integer total = jdbc.queryForObject(
                        "SELECT COUNT(m.id) FROM member m JOIN sector s ON m.sector_id = s.id WHERE s.name ILIKE ? AND m.status = 'ACTIVE'",
                        new Object[]{sectorName}, Integer.class);

                if (total == null || total == 0) {
                    logger.info("Sector {} has no active members, skipping.", sectorName);
                    continue;
                }

                int tgt = Math.max(1, (int) Math.floor(total * (seedPercent / 100.0))); // percent-based

                // select random members id limited to tgt
                List<UUID> ids = jdbc.query(
                        "SELECT m.id FROM member m JOIN sector s ON m.sector_id = s.id WHERE s.name ILIKE ? AND m.status = 'ACTIVE' ORDER BY random() LIMIT ?",
                        new Object[]{sectorName, tgt}, (rs, rowNum) -> UUID.fromString(rs.getString("id")));

                int inserted = 0;
                for (UUID memberId : ids) {
                    // pick random date in Feb 2026
                    int day = 1 + (int) (Math.random() * 28);
                    LocalDate d = LocalDate.of(2026, 2, day);

                    // insert only if not exists (use count to avoid EmptyResult exceptions)
                    Integer existsCount = jdbc.queryForObject(
                            "SELECT COUNT(1) FROM bible_reading br WHERE br.member_id = ? AND br.reading_date >= '2026-02-01' AND br.reading_date <= '2026-02-28'",
                            new Object[]{memberId}, Integer.class);

                    if (existsCount == null || existsCount == 0) {
                        // perform insert
                        jdbc.update(
                                "INSERT INTO bible_reading (member_id, reading_date, book_name, chapter, verse_start, verse_end, completed, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, now())",
                                memberId, Date.valueOf(d), "Mazmur", 1, 1, 5, true, "Dummy entry: membaca Feb 2026"
                        );
                        inserted++;
                    }
                }

                // count after insert
                Integer afterCount = jdbc.queryForObject(
                        "SELECT COUNT(br.*) FROM bible_reading br JOIN member m ON br.member_id = m.id JOIN sector s ON m.sector_id = s.id WHERE s.name ILIKE ? AND br.reading_date >= '2026-02-01' AND br.reading_date <= '2026-02-28'",
                        new Object[]{sectorName}, Integer.class);

                logger.info("Sector {} - total active members: {}, seed target: {}%, target seeded: {}, inserted now: {}, total bible_reading in Feb: {}",
                        sectorName, total, seedPercent, tgt, inserted, afterCount == null ? 0 : afterCount);

                // -------------------------------
                // Also seed attendance for selected members (Sundays in Feb 2026)
                // -------------------------------
                int[] sundays = {1, 8, 15, 22};
                int insertedAttendance = 0;
                for (UUID memberId : ids) {
                    for (int sDay : sundays) {
                        LocalDate attendDate = LocalDate.of(2026, 2, sDay);

                        Integer attExistsCount = jdbc.queryForObject(
                                "SELECT COUNT(1) FROM attendance a WHERE a.member_id = ? AND a.attend_date = ?",
                                new Object[]{memberId, Date.valueOf(attendDate)}, Integer.class);

                        if (attExistsCount == null || attExistsCount == 0) {
                            jdbc.update(
                                    "INSERT INTO attendance (member_id, attend_date, event, present, note, created_at) VALUES (?, ?, ?, ?, ?, now())",
                                    memberId, Date.valueOf(attendDate), "Ibadah Minggu", true, "Dummy attendance Feb 2026"
                            );
                            insertedAttendance++;
                        }
                    }
                }

                Integer afterAtt = jdbc.queryForObject(
                        "SELECT COUNT(a.*) FROM attendance a JOIN member m ON a.member_id = m.id JOIN sector s ON m.sector_id = s.id WHERE s.name ILIKE ? AND a.attend_date >= '2026-02-01' AND a.attend_date <= '2026-02-28'",
                        new Object[]{sectorName}, Integer.class);

                logger.info("Sector {} - inserted attendance rows now: {}, total attendance rows in Feb: {}",
                        sectorName, insertedAttendance, afterAtt == null ? 0 : afterAtt);

            } catch (Exception e) {
                logger.error("Error while seeding sector {}: {}", sectorName, e.getMessage(), e);
            }
        }

        logger.info("DataSeederRunner: Seeding completed.");
    }
}
