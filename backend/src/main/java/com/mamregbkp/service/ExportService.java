package com.mamregbkp.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.mamregbkp.dto.SectorAttendanceReportDto;
import com.mamregbkp.dto.SectorBibleReadingReportDto;
import com.mamregbkp.dto.WeeklyAttendanceDto;
import com.mamregbkp.dto.MemberDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.List;
import com.mamregbkp.repository.SectorRepository;

/**
 * ExportService
 * <p>
 * Tahap 1 (implementasi satu-per-satu):
 * - Bible Reading Report per sektor -> Excel & PDF
 * <p>
 * Tahap berikutnya bisa ditambah:
 * - Attendance report
 * - Finance report
 * - Member list
 */
@Service
public class ExportService {

    private final DashboardService dashboardService;
    private final FinanceService financeService;
    private final MemberService memberService;
    private final SectorRepository sectorRepository;

    @Autowired
    public ExportService(DashboardService dashboardService, FinanceService financeService, MemberService memberService, SectorRepository sectorRepository) {
        this.dashboardService = dashboardService;
        this.financeService = financeService;
        this.memberService = memberService;
        this.sectorRepository = sectorRepository;
    }

    public byte[] exportSectorBibleReadingReportExcel(int year, int month) {
        List<SectorBibleReadingReportDto> rows = dashboardService.getSectorBibleReadingReport(year, month);

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Bible Reading Report");

            int r = 0;
            // Title row
            Row titleRow = sheet.createRow(r++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(buildTitle("Laporan Baca Alkitab per Sektor", year, month));

            // Title style
            CellStyle titleStyle = wb.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            r++; // empty row

            // Header
            Row header = sheet.createRow(r++);
            String[] headers = new String[]{
                    "Nama Sektor",
                    "Jumlah Anggota",
                    "Yang Sudah Baca",
                    "Rata-rata % Baca",
                    "Kategori",
                    "Keterangan"
            };

            CellStyle headerStyle = createHeaderStyle(wb);
            for (int i = 0; i < headers.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            CellStyle percentStyle = wb.createCellStyle();
            percentStyle.setDataFormat(wb.createDataFormat().getFormat("0%"));

            // Data
            for (SectorBibleReadingReportDto dto : rows) {
                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(nullSafe(dto.getSectorName()));
                row.createCell(1).setCellValue(dto.getTotalMembers());
                row.createCell(2).setCellValue(dto.getMembersWhoRead());

                Cell avgCell = row.createCell(3);
                if (hasBibleReadingData(dto)) {
                    avgCell.setCellValue(dto.getAveragePercentage() / 100.0);
                    avgCell.setCellStyle(percentStyle);
                } else {
                    avgCell.setCellValue("-");
                }

                row.createCell(4).setCellValue(getBibleReadingCategoryDisplay(dto));
                row.createCell(5).setCellValue(getBibleReadingDescriptionDisplay(dto));

                // highlight TOTAL row
                if (dto.getSectorId() == null || "Total".equalsIgnoreCase(dto.getSectorName())) {
                    CellStyle totalStyle = createTotalRowStyle(wb);
                    for (int i = 0; i < headers.length; i++) {
                        row.getCell(i).setCellStyle(totalStyle);
                    }
                    if (hasBibleReadingData(dto)) {
                        avgCell.setCellStyle(mergeStyles(wb, totalStyle, percentStyle));
                    }
                }
            }

            // sizing
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            // merge title across columns
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));

            wb.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Gagal membuat file Excel laporan baca Alkitab", e);
        }
    }

    public byte[] exportSectorBibleReadingReportPdf(int year, int month) {
        List<SectorBibleReadingReportDto> rows = dashboardService.getSectorBibleReadingReport(year, month);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate(), 24, 24, 24, 24);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA, 14, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA, 10, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, com.lowagie.text.Font.NORMAL);

            Paragraph title = new Paragraph(buildTitle("Laporan Baca Alkitab per Sektor", year, month), titleFont);
            title.setSpacingAfter(12);
            doc.add(title);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3.2f, 1.4f, 1.4f, 1.6f, 1.6f, 3.8f});

            addHeaderCell(table, "Nama Sektor", headerFont);
            addHeaderCell(table, "Jumlah Anggota", headerFont);
            addHeaderCell(table, "Yang Sudah Baca", headerFont);
            addHeaderCell(table, "Rata-rata % Baca", headerFont);
            addHeaderCell(table, "Kategori", headerFont);
            addHeaderCell(table, "Keterangan", headerFont);

            for (SectorBibleReadingReportDto dto : rows) {
                boolean isTotal = dto.getSectorId() == null || "Total".equalsIgnoreCase(dto.getSectorName());
                com.lowagie.text.Font f = isTotal
                        ? FontFactory.getFont(FontFactory.HELVETICA, 10, com.lowagie.text.Font.BOLD)
                        : cellFont;

                addBodyCell(table, nullSafe(dto.getSectorName()), f);
                addBodyCell(table, String.valueOf(dto.getTotalMembers()), f);
                addBodyCell(table, String.valueOf(dto.getMembersWhoRead()), f);
                addBodyCell(table, getBibleReadingPercentageDisplay(dto), f);
                addBodyCell(table, getBibleReadingCategoryDisplay(dto), f);
                addBodyCell(table, getBibleReadingDescriptionDisplay(dto), f);
            }

            doc.add(table);
            doc.close();

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat file PDF laporan baca Alkitab", e);
        }
    }

    public byte[] exportSectorAttendanceReportExcel(int year, int month) {
        List<SectorAttendanceReportDto> rows = dashboardService.getSectorAttendanceReport(year, month);

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Attendance Report");

            int r = 0;
            // Title
            Row titleRow = sheet.createRow(r++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(buildTitle("Laporan Kehadiran per Sektor", year, month));

            CellStyle titleStyle = wb.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            r++;

            // Header
            String[] headers = new String[]{
                    "Sektor",
                    "Jml Anggota",
                    "M1 Hadir", "M1 Kolekte", "M1 %",
                    "M2 Hadir", "M2 Kolekte", "M2 %",
                    "M3 Hadir", "M3 Kolekte", "M3 %",
                    "M4 Hadir", "M4 Kolekte", "M4 %",
                    "Total Hadir", "Total Kolekte", "Rata-rata %"
            };

            Row header = sheet.createRow(r++);
            CellStyle headerStyle = createHeaderStyle(wb);
            for (int i = 0; i < headers.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            CellStyle moneyStyle = wb.createCellStyle();
            moneyStyle.setDataFormat(wb.createDataFormat().getFormat("#,##0"));

            CellStyle percentStyle = wb.createCellStyle();
            percentStyle.setDataFormat(wb.createDataFormat().getFormat("0%"));

            for (SectorAttendanceReportDto dto : rows) {
                Row row = sheet.createRow(r++);
                int col = 0;
                row.createCell(col++).setCellValue(nullSafe(dto.getSectorName()));
                row.createCell(col++).setCellValue(dto.getTotalMembers());

                for (int week = 1; week <= 4; week++) {
                    WeeklyAttendanceDto w = findWeek(dto.getWeeklyData(), week);
                    int attended = w != null ? w.getAttendedCount() : 0;
                    BigDecimal kolpi = w != null && w.getKolpiAmount() != null ? w.getKolpiAmount() : BigDecimal.ZERO;
                    double pct = w != null ? w.getAttendancePercentage() : 0;

                    row.createCell(col++).setCellValue(attended);

                    Cell money = row.createCell(col++);
                    money.setCellValue(kolpi.doubleValue());
                    money.setCellStyle(moneyStyle);

                    Cell p = row.createCell(col++);
                    p.setCellValue(pct / 100.0);
                    p.setCellStyle(percentStyle);
                }

                row.createCell(col++).setCellValue(dto.getTotalAttended());

                Cell totalMoney = row.createCell(col++);
                BigDecimal totalKolpi = dto.getTotalKolpiAmount() != null ? dto.getTotalKolpiAmount() : BigDecimal.ZERO;
                totalMoney.setCellValue(totalKolpi.doubleValue());
                totalMoney.setCellStyle(moneyStyle);

                Cell avgPct = row.createCell(col);
                avgPct.setCellValue(dto.getAverageAttendancePercentage() / 100.0);
                avgPct.setCellStyle(percentStyle);
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));

            wb.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Gagal membuat file Excel laporan kehadiran", e);
        }
    }

    public byte[] exportSectorAttendanceReportPdf(int year, int month) {
        List<SectorAttendanceReportDto> rows = dashboardService.getSectorAttendanceReport(year, month);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate(), 24, 24, 24, 24);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA, 14, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA, 9, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 9, com.lowagie.text.Font.NORMAL);

            Paragraph title = new Paragraph(buildTitle("Laporan Kehadiran per Sektor", year, month), titleFont);
            title.setSpacingAfter(12);
            doc.add(title);

            // 17 columns
            PdfPTable table = new PdfPTable(17);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{
                    2.6f, 1.0f,
                    1.0f, 1.2f, 0.9f,
                    1.0f, 1.2f, 0.9f,
                    1.0f, 1.2f, 0.9f,
                    1.0f, 1.2f, 0.9f,
                    1.1f, 1.3f, 1.0f
            });

            String[] headers = new String[]{
                    "Sektor", "Jml",
                    "M1 H", "M1 K", "M1 %",
                    "M2 H", "M2 K", "M2 %",
                    "M3 H", "M3 K", "M3 %",
                    "M4 H", "M4 K", "M4 %",
                    "Total H", "Total K", "Avg %"
            };
            for (String h : headers) addHeaderCell(table, h, headerFont);

            for (SectorAttendanceReportDto dto : rows) {
                addBodyCell(table, nullSafe(dto.getSectorName()), cellFont);
                addBodyCell(table, String.valueOf(dto.getTotalMembers()), cellFont);

                for (int week = 1; week <= 4; week++) {
                    WeeklyAttendanceDto w = findWeek(dto.getWeeklyData(), week);
                    int attended = w != null ? w.getAttendedCount() : 0;
                    BigDecimal kolpi = w != null && w.getKolpiAmount() != null ? w.getKolpiAmount() : BigDecimal.ZERO;
                    double pct = w != null ? w.getAttendancePercentage() : 0;

                    addBodyCell(table, String.valueOf(attended), cellFont);
                    addBodyCell(table, formatMoney(kolpi), cellFont);
                    addBodyCell(table, String.format(Locale.ROOT, "%.0f%%", pct), cellFont);
                }

                addBodyCell(table, String.valueOf(dto.getTotalAttended()), cellFont);
                BigDecimal totalKolpi = dto.getTotalKolpiAmount() != null ? dto.getTotalKolpiAmount() : BigDecimal.ZERO;
                addBodyCell(table, formatMoney(totalKolpi), cellFont);
                addBodyCell(table, String.format(Locale.ROOT, "%.0f%%", dto.getAverageAttendancePercentage()), cellFont);
            }

            doc.add(table);
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat file PDF laporan kehadiran", e);
        }
    }

    public byte[] exportFinanceReportExcel(int year, int month) {
        Map<String, Object> report = financeService.monthlyReport(month, year);
        Map<Long, Map<String, BigDecimal>> perSector = extractPerSector(report.get("perSector"));

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Finance Report");

            int r = 0;
            Row titleRow = sheet.createRow(r++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(buildTitle("Laporan Keuangan Bulanan", year, month));

            CellStyle titleStyle = wb.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            r++;

            // Summary section
            Row summaryHeader = sheet.createRow(r++);
            summaryHeader.createCell(0).setCellValue("Ringkasan");
            summaryHeader.getCell(0).setCellStyle(createHeaderStyle(wb));

            CellStyle moneyStyle = wb.createCellStyle();
            moneyStyle.setDataFormat(wb.createDataFormat().getFormat("#,##0"));

            r = writeKeyValue(sheet, r, "Total Pemasukan", report.get("totalIncome"), moneyStyle);
            r = writeKeyValue(sheet, r, "Total Pengeluaran", report.get("totalExpense"), moneyStyle);
            r = writeKeyValue(sheet, r, "Net", report.get("net"), moneyStyle);

            r++;

            String[] headers = new String[]{"Sektor", "Pemasukan", "Pengeluaran", "Net"};
            Row header = sheet.createRow(r++);
            CellStyle headerStyle = createHeaderStyle(wb);
            for (int i = 0; i < headers.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            for (Map.Entry<Long, Map<String, BigDecimal>> entry : perSector.entrySet()) {
                Long sectorId = entry.getKey();
                Map<String, BigDecimal> agg = entry.getValue();
                BigDecimal income = valueOrZero(agg.get("income"));
                BigDecimal expense = valueOrZero(agg.get("expense"));
                BigDecimal net = income.subtract(expense);

                Row row = sheet.createRow(r++);
                row.createCell(0).setCellValue(resolveSectorLabel(sectorId));

                Cell c1 = row.createCell(1);
                c1.setCellValue(income.doubleValue());
                c1.setCellStyle(moneyStyle);

                Cell c2 = row.createCell(2);
                c2.setCellValue(expense.doubleValue());
                c2.setCellStyle(moneyStyle);

                Cell c3 = row.createCell(3);
                c3.setCellValue(net.doubleValue());
                c3.setCellStyle(moneyStyle);
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));

            wb.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Gagal membuat file Excel laporan keuangan", e);
        }
    }

    public byte[] exportFinanceReportPdf(int year, int month) {
        Map<String, Object> report = financeService.monthlyReport(month, year);
        Map<Long, Map<String, BigDecimal>> perSector = extractPerSector(report.get("perSector"));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate(), 24, 24, 24, 24);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA, 14, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA, 10, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, com.lowagie.text.Font.NORMAL);

            Paragraph title = new Paragraph(buildTitle("Laporan Keuangan Bulanan", year, month), titleFont);
            title.setSpacingAfter(12);
            doc.add(title);

            Paragraph summary = new Paragraph(
                    "Total Pemasukan: " + formatMoney(asBigDecimal(report.get("totalIncome"))) +
                            " | Total Pengeluaran: " + formatMoney(asBigDecimal(report.get("totalExpense"))) +
                            " | Net: " + formatMoney(asBigDecimal(report.get("net"))),
                    cellFont
            );
            summary.setSpacingAfter(12);
            doc.add(summary);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.0f, 2.0f, 2.0f, 2.0f});

            addHeaderCell(table, "Sektor", headerFont);
            addHeaderCell(table, "Pemasukan", headerFont);
            addHeaderCell(table, "Pengeluaran", headerFont);
            addHeaderCell(table, "Net", headerFont);

            for (Map.Entry<Long, Map<String, BigDecimal>> entry : perSector.entrySet()) {
                Long sectorId = entry.getKey();
                Map<String, BigDecimal> agg = entry.getValue();
                BigDecimal income = valueOrZero(agg.get("income"));
                BigDecimal expense = valueOrZero(agg.get("expense"));
                BigDecimal net = income.subtract(expense);

                addBodyCell(table, resolveSectorLabel(sectorId), cellFont);
                addBodyCell(table, formatMoney(income), cellFont);
                addBodyCell(table, formatMoney(expense), cellFont);
                addBodyCell(table, formatMoney(net), cellFont);
            }

            doc.add(table);
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat file PDF laporan keuangan", e);
        }
    }

    public byte[] exportMembersExcel(String status, Long sectorId) {
        List<MemberDto> rows = loadAllMembers(status, sectorId);

        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Members");

            int r = 0;
            Row titleRow = sheet.createRow(r++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("Daftar Anggota");

            CellStyle titleStyle = wb.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = wb.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);

            r++;

            String[] headers = new String[]{
                    "No", "Nama", "Gender", "Tanggal Lahir", "No HP", "Email", "Sektor", "Jabatan", "Status",
                    "Mamre", "Saitun", "Kode Mamre", "Kode Saitun", "Alamat"
            };
            Row header = sheet.createRow(r++);
            CellStyle headerStyle = createHeaderStyle(wb);
            for (int i = 0; i < headers.length; i++) {
                Cell c = header.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }

            int no = 1;
            for (MemberDto dto : rows) {
                Row row = sheet.createRow(r++);
                int col = 0;
                row.createCell(col++).setCellValue(no++);
                row.createCell(col++).setCellValue(buildMemberName(dto));
                row.createCell(col++).setCellValue(nullSafe(dto.getGender()));
                row.createCell(col++).setCellValue(dto.getBirthDate() != null ? dto.getBirthDate().format(DateTimeFormatter.ISO_DATE) : "");
                row.createCell(col++).setCellValue(nullSafe(dto.getPhone()));
                row.createCell(col++).setCellValue(nullSafe(dto.getEmail()));
                row.createCell(col++).setCellValue(nullSafe(dto.getSectorName()));
                row.createCell(col++).setCellValue(nullSafe(dto.getPositionName()));
                row.createCell(col++).setCellValue(nullSafe(dto.getStatus()));
                row.createCell(col++).setCellValue(asCheck(dto.getMamre()));
                row.createCell(col++).setCellValue(asCheck(dto.getSaitun()));
                row.createCell(col++).setCellValue(nullSafe(dto.getKodeMamre()));
                row.createCell(col++).setCellValue(nullSafe(dto.getKodeSaitun()));
                row.createCell(col).setCellValue(nullSafe(dto.getAddress()));
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);
            sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, headers.length - 1));

            wb.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Gagal membuat file Excel daftar anggota", e);
        }
    }

    public byte[] exportMembersPdf(String status, Long sectorId) {
        List<MemberDto> rows = loadAllMembers(status, sectorId);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA, 14, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, com.lowagie.text.Font.BOLD);
            com.lowagie.text.Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, com.lowagie.text.Font.NORMAL);

            Paragraph title = new Paragraph("Daftar Anggota", titleFont);
            title.setSpacingAfter(10);
            doc.add(title);

            PdfPTable table = new PdfPTable(10);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{0.8f, 2.2f, 1.0f, 1.3f, 1.4f, 1.8f, 1.4f, 1.4f, 0.8f, 2.3f});

            String[] headers = new String[]{"No", "Nama", "Gender", "Tgl Lahir", "No HP", "Sektor", "Jabatan", "Status", "Mamre", "Alamat"};
            for (String h : headers) addHeaderCell(table, h, headerFont);

            int no = 1;
            for (MemberDto dto : rows) {
                addBodyCell(table, String.valueOf(no++), cellFont);
                addBodyCell(table, buildMemberName(dto), cellFont);
                addBodyCell(table, nullSafe(dto.getGender()), cellFont);
                addBodyCell(table, dto.getBirthDate() != null ? dto.getBirthDate().format(DateTimeFormatter.ISO_DATE) : "", cellFont);
                addBodyCell(table, nullSafe(dto.getPhone()), cellFont);
                addBodyCell(table, nullSafe(dto.getSectorName()), cellFont);
                addBodyCell(table, nullSafe(dto.getPositionName()), cellFont);
                addBodyCell(table, nullSafe(dto.getStatus()), cellFont);
                addBodyCell(table, asCheck(dto.getMamre()), cellFont);
                addBodyCell(table, nullSafe(dto.getAddress()), cellFont);
            }

            doc.add(table);
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Gagal membuat file PDF daftar anggota", e);
        }
    }

    private List<MemberDto> loadAllMembers(String status, Long sectorId) {
        List<MemberDto> result = new ArrayList<>();
        int page = 0;
        int size = 500;
        Page<MemberDto> current;
        do {
            Pageable pageable = PageRequest.of(page, size);
            current = memberService.list(null, status, sectorId, pageable);
            result.addAll(current.getContent());
            page++;
        } while (current.hasNext());
        return result;
    }

    private static String buildMemberName(MemberDto dto) {
        String first = dto.getFirstName() == null ? "" : dto.getFirstName().trim();
        String last = dto.getLastName() == null ? "" : dto.getLastName().trim();
        return (first + " " + last).trim();
    }

    private static String asCheck(Boolean value) {
        return Boolean.TRUE.equals(value) ? "v" : "";
    }

    private static int writeKeyValue(Sheet sheet, int rowIndex, String label, Object value, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIndex++);
        row.createCell(0).setCellValue(label);
        Cell valueCell = row.createCell(1);
        BigDecimal amount = asBigDecimal(value);
        valueCell.setCellValue(amount.doubleValue());
        valueCell.setCellStyle(valueStyle);
        return rowIndex;
    }

    @SuppressWarnings("unchecked")
    private static Map<Long, Map<String, BigDecimal>> extractPerSector(Object raw) {
        if (raw instanceof Map<?, ?> rawMap) {
            Map<Long, Map<String, BigDecimal>> result = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : rawMap.entrySet()) {
                Long key = entry.getKey() == null ? null : Long.valueOf(String.valueOf(entry.getKey()));
                Map<String, BigDecimal> agg = new LinkedHashMap<>();
                if (entry.getValue() instanceof Map<?, ?> innerMap) {
                    for (Map.Entry<?, ?> inner : innerMap.entrySet()) {
                        agg.put(String.valueOf(inner.getKey()), asBigDecimal(inner.getValue()));
                    }
                }
                result.put(key, agg);
            }
            return result;
        }
        return new LinkedHashMap<>();
    }

    private static BigDecimal asBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private static BigDecimal valueOrZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    private static String buildTitle(String base, int year, int month) {
        if (year > 0 && month > 0 && month <= 12) {
            String monthName = Month.of(month).getDisplayName(TextStyle.FULL, Locale.forLanguageTag("id-ID"));
            return base + " - " + monthName + " " + year;
        }
        return base + " - " + LocalDate.now();
    }

    private static CellStyle createHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private static CellStyle createTotalRowStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = wb.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private static CellStyle mergeStyles(Workbook wb, CellStyle base, CellStyle extra) {
        // Minimal helper: buat style baru dan copy beberapa properti utama.
        CellStyle style = wb.createCellStyle();
        style.cloneStyleFrom(base);
        style.setDataFormat(extra.getDataFormat());
        return style;
    }

    private static void addHeaderCell(PdfPTable table, String text, com.lowagie.text.Font font) {
        Phrase phrase = new Phrase(text);
        phrase.setFont(font);
        PdfPCell cell = new PdfPCell(phrase);
        cell.setBackgroundColor(new java.awt.Color(235, 235, 235));
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private static void addBodyCell(PdfPTable table, String text, com.lowagie.text.Font font) {
        Phrase phrase = new Phrase(text);
        phrase.setFont(font);
        PdfPCell cell = new PdfPCell(phrase);
        cell.setPadding(6f);
        table.addCell(cell);
    }

    private static WeeklyAttendanceDto findWeek(List<WeeklyAttendanceDto> weeks, int weekNumber) {
        if (weeks == null) return null;
        for (WeeklyAttendanceDto w : weeks) {
            if (w != null && w.getWeekNumber() == weekNumber) return w;
        }
        return null;
    }

    private static String formatMoney(BigDecimal v) {
        if (v == null) return "0";
        try {
            return String.format(Locale.forLanguageTag("id-ID"), "%,d", v.longValue());
        } catch (Exception e) {
            return v.toPlainString();
        }
    }

    private static boolean hasBibleReadingData(SectorBibleReadingReportDto dto) {
        return dto != null && dto.getAveragePercentage() > 0;
    }

    private static String getBibleReadingPercentageDisplay(SectorBibleReadingReportDto dto) {
        if (!hasBibleReadingData(dto)) {
            return "-";
        }
        return String.format(Locale.ROOT, "%.0f%%", dto.getAveragePercentage());
    }

    private static String getBibleReadingCategoryDisplay(SectorBibleReadingReportDto dto) {
        if (!hasBibleReadingData(dto)) {
            return "-";
        }
        return nullSafe(dto.getCategory());
    }

    private static String getBibleReadingDescriptionDisplay(SectorBibleReadingReportDto dto) {
        if (!hasBibleReadingData(dto)) {
            return "Belum ada data";
        }
        return nullSafe(dto.getDescription());
    }

    private String resolveSectorLabel(Long sectorId) {
        if (sectorId == null || sectorId == 0L) {
            return "General";
        }
        return sectorRepository.findById(sectorId)
                .map(sector -> nullSafe(sector.getName()))
                .filter(name -> !name.isBlank())
                .orElse("Sektor " + sectorId);
    }
}
