# 📋 TODO List - Dashboard Enhancement
## Tanggal: 2 Februari 2026

---

## 🎨 **Frontend - UI/UX Improvements**

### 1. **Dark Mode Support** ✅ COMPLETED
- [x] Tambahkan variabel warna untuk dark theme (`styles.scss`)
- [x] Implementasi toggle dark/light mode di header (`app-layout.component.*`)
- [x] Simpan preferensi user di localStorage (`theme.service.ts`)
- [x] Update semua komponen untuk mendukung dark mode (`dashboard.component.scss`, `app-layout.component.scss`)

### 2. **Chart Improvements**
- [ ] Tambahkan animasi loading skeleton untuk charts
- [ ] Implementasi chart tooltip yang lebih informatif
- [ ] Responsive legend untuk mobile view

### 3. **Dashboard Widgets**
- [ ] Buat widget yang bisa di-drag & drop (reorder)
- [ ] Tambahkan opsi hide/show widget tertentu
- [ ] Simpan layout preference user
- [ ] Tambahkan widget baru: Calendar Events

### 4. **Performance Optimization**
- [ ] Implementasi lazy loading untuk charts
- [ ] Optimasi re-render dengan OnPush change detection
- [ ] Virtual scrolling untuk birthday list
- [ ] Caching data dengan RxJS shareReplay

---

## 🔧 **Backend Enhancements**

### 5. **API Optimization**
- [ ] Implementasi Redis caching untuk dashboard stats
- [ ] Batch API calls untuk mengurangi request
- [ ] Tambahkan endpoint `/api/dashboard/widgets` untuk konfigurasi widget
- [ ] Implementasi WebSocket untuk real-time updates

### 6. **Security Improvements**
- [ ] Rate limiting untuk API endpoints
- [ ] Implementasi audit log untuk aktivitas user
- [ ] Tambahkan CAPTCHA untuk login setelah 3x gagal
- [ ] Enkripsi data sensitif di database

---

## 📱 **Mobile & Responsive**

### 7. **PWA (Progressive Web App)**
- [ ] Tambahkan service worker untuk offline support
- [ ] Implementasi push notifications untuk birthday reminders
- [ ] Tambahkan manifest.json untuk installable app
- [ ] Optimasi untuk mobile-first experience

### 8. **Touch Interactions**
- [ ] Swipe gesture untuk navigasi antar section
- [ ] Pull-to-refresh untuk update data
- [ ] Long press untuk quick actions pada cards
- [ ] Pinch-to-zoom untuk charts

---

## 📊 **New Features**

### 9. **Advanced Analytics**
- [ ] Tambahkan filter periode (weekly/monthly/yearly)
- [ ] Comparison chart (bulan ini vs bulan lalu)
- [ ] Export laporan ke Excel/PDF
- [ ] Scheduled email report

### 10. **Notification System**
- [ ] In-app notification center
- [ ] Email notification untuk birthday
- [ ] SMS notification (opsional)
- [ ] Notification preferences per user

### 11. **User Management**
- [ ] Role-based dashboard view (Admin vs User)
- [ ] Customizable dashboard per role
- [ ] Activity log per user
- [ ] Session management

---

## 🐛 **Bug Fixes & Polish**

### 12. **Known Issues**
- [ ] Fix chart resize issue saat window resize
- [ ] Perbaiki animation glitch pada stat cards di Safari
- [ ] Handle empty state dengan lebih baik
- [ ] Improve error handling dan retry mechanism

### 13. **Accessibility (a11y)**
- [ ] Tambahkan ARIA labels untuk semua interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast compliance (WCAG 2.1)

---

## 🧪 **Testing**

### 14. **Unit & Integration Tests**
- [ ] Unit test untuk dashboard component
- [ ] E2E test dengan Cypress/Playwright
- [ ] Performance test dengan Lighthouse
- [ ] Cross-browser testing

---

## 📝 **Documentation**

### 15. **Technical Docs**
- [ ] Update README dengan screenshot baru
- [ ] Dokumentasi API endpoints
- [ ] Component library documentation
- [ ] Deployment guide

---

## Priority Order (Recommended):

| Priority | Task | Effort |
|----------|------|--------|
| 🔴 High | Dark Mode Support | Medium |
| 🔴 High | Chart Loading Skeleton | Low |
| 🟡 Medium | PWA Implementation | High |
| 🟡 Medium | Export to Excel/PDF | Medium |
| 🟢 Low | Drag & Drop Widgets | High |
| 🟢 Low | WebSocket Real-time | High |

---

*Generated: 2 Februari 2026*
