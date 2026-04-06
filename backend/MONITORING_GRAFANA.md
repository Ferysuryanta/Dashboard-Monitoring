# Konfigurasi Grafana untuk Project Mamre GBKP

Dokumen ini menjelaskan langkah setup monitoring **Spring Boot Backend -> Prometheus -> Grafana** untuk project ini.

## Checklist ringkas

- Backend expose metrics di `/actuator/prometheus`
- Prometheus scrape endpoint backend
- Grafana baca data dari Prometheus
- Dashboard menampilkan metric JVM, HTTP request, dan health dasar backend

## 1. Yang sudah disiapkan di project

Backend sekarang sudah mendukung:

- `spring-boot-starter-actuator`
- `micrometer-registry-prometheus`
- endpoint metrics di `http://localhost:8080/actuator/prometheus`
- endpoint health di `http://localhost:8080/actuator/health`

Catatan profile:

- **dev**: endpoint Prometheus dibuka publik untuk memudahkan local setup
- **prod**: endpoint Prometheus **default tertutup** kecuali `MONITORING_PROMETHEUS_PUBLIC=true`

---

## 2. Jalankan backend

Dari root project, jalankan backend dengan profile dev:

```powershell
Set-Location "E:\Development\monitoring\Dashboard-Monitoring\backend"
mvn "-Dspring-boot.run.profiles=dev" spring-boot:run
```

Verifikasi endpoint metrics:

```powershell
Invoke-WebRequest "http://localhost:8080/actuator/health" | Select-Object -ExpandProperty Content
Invoke-WebRequest "http://localhost:8080/actuator/prometheus" | Select-Object -ExpandProperty Content
```

Jika endpoint kedua mengembalikan teks metric Prometheus, backend siap dipantau.

---

## 3. Jalankan Prometheus + Grafana dengan Docker Compose (rekomendasi)

Folder `backend/monitoring/` sekarang sudah berisi:

- `docker-compose.yml`
- `prometheus.yml`
- `grafana/provisioning/datasources/prometheus.yml`
- `grafana/provisioning/dashboards/dashboards.yml`
- `grafana/dashboards/mamre-backend-overview.json`

Jalankan stack monitoring:

```powershell
Set-Location "E:\Development\monitoring\Dashboard-Monitoring\backend\monitoring"
docker compose up -d
```

Lalu akses:

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

Login Grafana default:

- user: `admin`
- password: `admin`

Penting:

- kredensial `GF_SECURITY_ADMIN_USER` dan `GF_SECURITY_ADMIN_PASSWORD` hanya dipakai saat Grafana pertama kali menginisialisasi data internalnya
- jika container `mamre-grafana` sudah pernah berjalan sebelumnya, password lama bisa tetap tersimpan walaupun file `docker-compose.yml` masih menulis `admin/admin`
- akibatnya, login bisa gagal meskipun konfigurasi environment terlihat benar

Datasource dan dashboard awal akan otomatis muncul.

Untuk mematikan stack:

```powershell
Set-Location "E:\Development\monitoring\Dashboard-Monitoring\backend\monitoring"
docker compose down
```

### Troubleshooting login Grafana gagal

Jika `admin/admin` tidak bisa dipakai:

1. pastikan Anda membuka instance yang benar: `http://localhost:3001`
2. cek container yang aktif memang `mamre-grafana`
3. reset password admin secara langsung di container:

```powershell
docker exec mamre-grafana grafana cli admin reset-admin-password admin
```

4. setelah itu login lagi dengan:

- user: `admin`
- password: `admin`

Jika masih ingin start benar-benar bersih, hapus container lalu jalankan ulang stack monitoring:

```powershell
Set-Location "E:\Development\monitoring\Dashboard-Monitoring\backend\monitoring"
docker compose down
docker rm -f mamre-grafana
docker compose up -d
```

---

## 4. Konfigurasi Prometheus

File contoh scrape config sudah disediakan di:

- `backend/monitoring/prometheus.yml`

### Opsi A - Jalankan Prometheus via Docker

```powershell
Set-Location "E:\Development\monitoring\Dashboard-Monitoring\backend\monitoring"
docker run --name mamre-prometheus --rm -p 9090:9090 -v "${PWD}\prometheus.yml:/etc/prometheus/prometheus.yml" prom/prometheus
```

Setelah jalan, buka:

- `http://localhost:9090`

Lalu cek target pada menu **Status -> Targets**.
Target `mamre-backend` harus status **UP**.

### Opsi B - Jalankan Prometheus lokal tanpa Docker

1. Install Prometheus di mesin lokal
2. Ganti file config default dengan isi `backend/monitoring/prometheus.yml`
3. Jalankan Prometheus dan arahkan ke file config tersebut

---

## 5. Konfigurasi Grafana

File provisioning datasource contoh sudah disediakan di:

- `backend/monitoring/grafana-datasource.yml`

### Opsi A - Jalankan Grafana via Docker manual

```powershell
Set-Location "E:\Development\monitoring\Dashboard-Monitoring\backend\monitoring"
docker run --name mamre-grafana --rm -p 3001:3000 -e GF_SECURITY_ADMIN_USER=admin -e GF_SECURITY_ADMIN_PASSWORD=admin -v "${PWD}\grafana-datasource.yml:/etc/grafana/provisioning/datasources/prometheus.yml" grafana/grafana-oss
```

Buka:

- `http://localhost:3001`

Login default:

- user: `admin`
- password: `admin`

Datasource Prometheus akan otomatis mengarah ke `http://host.docker.internal:9090`.

### Opsi B - Tambah datasource manual di UI Grafana

Jika tidak memakai provisioning file:

1. Login ke Grafana
2. Buka **Connections -> Data sources**
3. Klik **Add data source**
4. Pilih **Prometheus**
5. Isi URL:
   - jika Grafana jalan di Docker: `http://host.docker.internal:9090`
   - jika Grafana jalan lokal biasa: `http://localhost:9090`
6. Klik **Save & test**

---

## 6. Dashboard bawaan yang sudah disediakan

Grafana sekarang otomatis memuat dashboard:

- `Mamre Backend Overview`

Panel awal yang sudah tersedia:

1. Backend Status
2. Request Rate
3. Average Latency
4. Process CPU
5. JVM Heap Memory
6. Threads & Uptime
7. HTTP Requests by Status
8. Top Endpoint Request Rate
9. System CPU
10. HTTP Request Count
11. JVM Memory by Area
12. Top Endpoint Max Latency
13. Anggota Aktif
14. Kehadiran Bulan Ini
15. Status Program Mamre

---

## 7. Panel tambahan yang direkomendasikan

Setelah datasource aktif, buat dashboard baru dan gunakan metric berikut:

### JVM / aplikasi

- `jvm_memory_used_bytes`
- `jvm_memory_max_bytes`
- `jvm_threads_live_threads`
- `process_uptime_seconds`
- `system_cpu_usage`
- `process_cpu_usage`

### HTTP / request backend

- `http_server_requests_seconds_count`
- `http_server_requests_seconds_sum`
- `http_server_requests_seconds_max`

Contoh query request rate:

```promql
sum(rate(http_server_requests_seconds_count[5m])) by (uri, method, status)
```

Contoh query latency rata-rata:

```promql
sum(rate(http_server_requests_seconds_sum[5m])) by (uri)
/
sum(rate(http_server_requests_seconds_count[5m])) by (uri)
```

### Kesehatan service

- `up{job="mamre-backend"}`

### Metric bisnis Mamre

- `mamre_members`
- `mamre_members_active`
- `mamre_attendance_unique_members_current_month`
- `mamre_attendance_total_current_month`
- `mamre_programs`
- `mamre_programs_status{status="PLANNED"}`
- `mamre_programs_status{status="DONE"}`

---

## 8. Rekomendasi dashboard lanjutan

Minimal buat panel berikut:

1. **Backend Up / Down**
   - query: `up{job="mamre-backend"}`
2. **Request per menit**
   - query: `sum(rate(http_server_requests_seconds_count[1m]))`
3. **CPU usage**
   - query: `process_cpu_usage`
4. **Heap used**
   - query: `jvm_memory_used_bytes{area="heap"}`
5. **Thread aktif**
   - query: `jvm_threads_live_threads`
6. **Latency per endpoint**
   - query rata-rata latency per URI

---

## 9. Catatan production

Untuk production, default project ini **tidak** membuka `/actuator/prometheus` ke publik.

Jika Prometheus berjalan di jaringan internal yang aman dan memang perlu scrape langsung:

```bash
MONITORING_PROMETHEUS_PUBLIC=true
```

Rekomendasi tetap:

- expose endpoint hanya di private network / VPN
- atau letakkan backend di balik reverse proxy internal
- jangan buka `/actuator/prometheus` ke internet publik tanpa pembatasan tambahan

Endpoint yang tetap aman dibuka publik:

- `/actuator/health`
- `/actuator/info`

---

## 10. Variabel environment terkait monitoring

Backend ini mendukung variabel berikut:

```bash
MONITORING_PROMETHEUS_PUBLIC=false
MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE=health,info,prometheus
MANAGEMENT_METRICS_TAG_APPLICATION=mamre-backend
MANAGEMENT_METRICS_TAG_ENVIRONMENT=dev
```

---

## 11. Alur integrasi singkat

```text
Spring Boot Backend
  -> /actuator/prometheus
  -> scraped by Prometheus
  -> queried by Grafana
```

Dashboard sekarang juga sudah memuat metric bisnis dasar Mamre seperti anggota aktif, kehadiran bulan ini, dan status program. Langkah berikutnya yang paling natural adalah menambahkan metric bisnis lanjutan seperti distribusi sektor, progres baca Alkitab, atau attendance rate per sektor.

