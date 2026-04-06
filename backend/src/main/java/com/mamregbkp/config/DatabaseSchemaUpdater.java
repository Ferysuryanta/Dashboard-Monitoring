package com.mamregbkp.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Runs database schema updates on application startup.
 * This ensures new columns are added even when Flyway is disabled.
 */
@Component
@ConditionalOnProperty(prefix = "app.startup.schema-updater", name = "enabled", havingValue = "true")
public class DatabaseSchemaUpdater implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaUpdater.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Checking and updating database schema...");

        // Add kolpi_amount column to attendance table if not exists
        addKolpiAmountColumn();

        // Insert sample attendance data for current month if empty
        insertSampleAttendanceData();

        log.info("Database schema check completed.");
    }

    private void addKolpiAmountColumn() {
        try {
            // Check if column exists
            String checkSql = "SELECT COUNT(*) FROM information_schema.columns " +
                    "WHERE table_name = 'attendance' AND column_name = 'kolpi_amount'";

            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class);

            if (count == null || count == 0) {
                log.info("Adding kolpi_amount column to attendance table...");
                String alterSql = "ALTER TABLE attendance ADD COLUMN kolpi_amount DECIMAL(15, 2) DEFAULT 0";
                jdbcTemplate.execute(alterSql);
                log.info("Column kolpi_amount added successfully.");
            } else {
                log.info("Column kolpi_amount already exists.");
            }
        } catch (Exception e) {
            log.warn("Could not add kolpi_amount column: {}", e.getMessage());
        }
    }

    private void insertSampleAttendanceData() {
        try {
            // Get current year and month
            LocalDate now = LocalDate.now();
            int year = now.getYear();
            int month = now.getMonthValue();

            LocalDate startOfMonth = LocalDate.of(year, month, 1);

            log.info("Checking attendance data for {}-{}...", year, month);

            // Get all members with sector
            String memberSql = "SELECT m.id, s.name as sector_name FROM member m " +
                    "JOIN sector s ON m.sector_id = s.id WHERE m.sector_id IS NOT NULL";
            List<Map<String, Object>> members = jdbcTemplate.queryForList(memberSql);

            if (members.isEmpty()) {
                log.warn("No members with sector found. Cannot insert sample attendance data.");
                return;
            }

            log.info("Found {} members with sector. Inserting sample attendance data...", members.size());

            // Define Sundays for the month (weeks 1-4)
            LocalDate[] sundays = new LocalDate[4];
            LocalDate firstDay = startOfMonth;

            // Find first Sunday
            while (firstDay.getDayOfWeek().getValue() != 7) {
                firstDay = firstDay.plusDays(1);
            }

            for (int i = 0; i < 4 && firstDay.getMonthValue() == month; i++) {
                sundays[i] = firstDay;
                log.info("Week {} Sunday: {}", i + 1, sundays[i]);
                firstDay = firstDay.plusWeeks(1);
            }

            int insertedCount = 0;
            int skippedCount = 0;

            for (Map<String, Object> member : members) {
                Object memberId = member.get("id");
                String sectorName = (String) member.get("sector_name");

                for (int week = 0; week < 4; week++) {
                    if (sundays[week] == null) continue;

                    // Skip future dates
                    if (sundays[week].isAfter(now)) {
                        continue;
                    }

                    // Check if attendance already exists
                    String existsSql = "SELECT COUNT(*) FROM attendance WHERE member_id = ?::uuid AND attend_date = ?";
                    Integer exists = jdbcTemplate.queryForObject(existsSql, Integer.class, memberId.toString(), sundays[week]);

                    if (exists != null && exists > 0) {
                        skippedCount++;
                        continue;
                    }

                    // Random attendance (85% chance of attending)
                    boolean present = Math.random() < 0.85;

                    // Random kolekte (50k - 200k)
                    double kolpiAmount = present ? (Math.random() * 150000 + 50000) : 0;

                    String insertSql = "INSERT INTO attendance (member_id, attend_date, event, present, kolpi_amount, note, created_at) " +
                            "VALUES (?::uuid, ?, ?, ?, ?, ?, NOW())";

                    jdbcTemplate.update(insertSql,
                            memberId.toString(),
                            sundays[week],
                            "Ibadah Minggu",
                            present,
                            kolpiAmount,
                            "Sample data - " + sectorName + " - Minggu ke-" + (week + 1)
                    );
                    insertedCount++;
                }
            }

            log.info("Inserted {} new attendance records. Skipped {} existing records.", insertedCount, skippedCount);

        } catch (Exception e) {
            log.error("Could not insert sample attendance data: {}", e.getMessage(), e);
        }
    }
}
