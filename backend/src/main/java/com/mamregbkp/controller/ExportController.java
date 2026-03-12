package com.mamregbkp.controller;

import com.mamregbkp.service.ExportService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    /**
     * Tahap 1: Export laporan baca Alkitab per sektor.
     *
     * year/month boleh 0 -> DashboardServiceImpl akan pakai current year/month.
     */
    @GetMapping(value = "/bible-reading/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportBibleReadingExcel(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month
    ) {
        byte[] bytes = exportService.exportSectorBibleReadingReportExcel(year, month);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=laporan_baca_alkitab.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @GetMapping(value = "/bible-reading/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportBibleReadingPdf(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month
    ) {
        byte[] bytes = exportService.exportSectorBibleReadingReportPdf(year, month);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=laporan_baca_alkitab.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }

    @GetMapping(value = "/attendance/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportAttendanceExcel(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month
    ) {
        byte[] bytes = exportService.exportSectorAttendanceReportExcel(year, month);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=laporan_kehadiran.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @GetMapping(value = "/attendance/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportAttendancePdf(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month
    ) {
        byte[] bytes = exportService.exportSectorAttendanceReportPdf(year, month);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=laporan_kehadiran.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }

    @GetMapping(value = "/finance/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportFinanceExcel(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month
    ) {
        byte[] bytes = exportService.exportFinanceReportExcel(year, month);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=laporan_keuangan.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @GetMapping(value = "/finance/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportFinancePdf(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month
    ) {
        byte[] bytes = exportService.exportFinanceReportPdf(year, month);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=laporan_keuangan.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }

    @GetMapping(value = "/members/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportMembersExcel(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long sectorId
    ) {
        byte[] bytes = exportService.exportMembersExcel(status, sectorId);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=daftar_anggota.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @GetMapping(value = "/members/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportMembersPdf(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long sectorId
    ) {
        byte[] bytes = exportService.exportMembersPdf(status, sectorId);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=daftar_anggota.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }
}
