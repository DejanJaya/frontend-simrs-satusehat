# 🏥 Frontend SIM-Klinik Rawat Jalan Terintegrasi SATUSEHAT Kemenkes RI

Frontend Single Page Application (SPA) untuk Sistem Informasi Manajemen Klinik Rawat Jalan (SIMRS) berbasis **Vue 3** dan **Tabler UI (Bootstrap 5)**, terintegrasi secara *real-time* dengan standar rekam medis nasional **HL7 FHIR R4 Kemenkes RI**.

---

## 🚀 Fitur Utama

- **Alur Operasional Rawat Jalan 4 Tahap**:
  1. **🚶 Pasien Datang (Pendaftaran)**:
     - Form pendaftaran & pencarian pasien lama (No. RM / NIK).
     - Tombol cepat NIK Sandbox untuk pengujian instan.
     - Verifikasi otomatis NIK secara *real-time* ke SATUSEHAT (Lookup IHS Pasien).
     - Cetak Tiket Nomor Antrean PDF (`A-001`).
  2. **🩺 Diperiksa Dokter**:
     - Antrean pasien per poli/dokter.
     - Anamnesa keluhan utama & pemeriksaan fisik.
     - Input tanda vital (Tensi, Nadi, Suhu, Pernapasan) berstandar FHIR `Observation`.
     - Pilihan cepat diagnosa penyakit standar **ICD-10** berstandar FHIR `Condition`.
     - E-Resep obat berstandar FHIR `MedicationRequest`.
     - Cetak Lembar Resep Dokter Resmi (*Recipe / R/*) PDF dengan kop klinik.
  3. **💊 Ambil Obat & Kasir**:
     - Antrean resep farmasi dan penyerahan obat berstandar FHIR `MedicationDispense`.
     - Pembayaran tagihan kasir (Tunai / Transfer / Qris).
     - Cetak Kuitansi Pembayaran & Faktur Kasir PDF resmi berstempel lunas.
  4. **🏁 Selesai (Pulang)**:
     - Otomatis memperbarui status kunjungan dan menutup encounter di SATUSEHAT.
- **Monitoring SATUSEHAT Terpadu**:
  - Indikator status autentikasi OAuth2 Sandbox *live*.
  - Riwayat pengiriman log HL7 FHIR (Encounter, Observation, Condition, Medication).
  - Viewer *accordion* payload interaktif untuk menginspeksi JSON request & response Kemenkes.
- **Desain UI/UX Modern & Responsif**:
  - Template Tabler UI (Bootstrap 5) yang bersih dan intuitif.
  - Sidebar vertikal yang dapat disembunyikan (*collapsible toggle* via tombol `☰`) ke mode layar penuh (*full-screen*).
  - Terintegrasi dialog konfirmasi elegan menggunakan **SweetAlert2**.
  - Dilengkapi fitur *print-friendly* CSS (`@media print`) untuk mencetak dokumen rapi langsung ke printer atau format PDF.

---

## 🛠️ Tech Stack

- **Framework**: Vue 3 (Composition & Options API)
- **Build Tool**: Vite
- **UI Design System**: Tabler UI & Bootstrap 5
- **Routing**: Vue Router 4 (dengan Auth Navigation Guard)
- **Alert / Dialog**: SweetAlert2
- **Standard**: HL7 FHIR Release 4 & SATUSEHAT API

---

## 📂 Struktur Direktori

```
frontend/
├── src/
│   ├── assets/
│   │   ├── css/
│   │   │   └── tabler.min.css    # Stylesheet Tabler & Print CSS
│   │   └── js/
│   │       └── tabler.min.js     # Script komponen UI
│   ├── layouts/
│   │   └── MainLayout.vue        # Layout utama (Sidebar + Topbar + Profil)
│   ├── router/
│   │   └── index.js              # Rute halaman & proteksi login
│   ├── services/
│   │   └── api.js                # HTTP Client terhubung ke REST API backend
│   ├── utils/
│   │   └── alert.js              # Helper SweetAlert2
│   ├── views/
│   │   ├── DashboardView.vue     # Statistik 4 tahap alur rawat jalan
│   │   ├── DoctorExaminationView.vue # Formulir medis & e-resep
│   │   ├── DoctorQueueView.vue   # Antrean dokter per poli
│   │   ├── LoginView.vue         # Halaman login dengan tombol akun demo
│   │   ├── PharmacyView.vue      # Dispensing obat, kasir & kuitansi
│   │   ├── RegistrationView.vue  # Pendaftaran NIK & tiket antrean
│   │   └── SatusehatMonitoringView.vue # Log & viewer payload FHIR
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚙️ Instalasi & Menjalankan Frontend

### 1. Clone Repository & Install Dependensi
```bash
git clone https://github.com/DejanJaya/frontend-simrs-satusehat.git
cd frontend-simrs-satusehat
npm install
```

### 2. Jalankan Mode Pengembangan
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:3000`.

### 3. Build untuk Produksi
```bash
npm run build
```

---

## 👥 Akun Demo untuk Pengujian Cepat

Pada halaman login, Anda dapat mengklik tombol akun demo instan atau memasukkan kredensial berikut:

| Username | Password | Role / Peran |
|---|---|---|
| `admin` | `admin123` | Administrator Klinik |
| `resepsionis` | `pendaftaran123` | Petugas Pendaftaran |
| `dokter` | `dokter123` | Dokter Pemeriksa |
| `farmasi` | `farmasi123` | Petugas Farmasi & Kasir |

---

## 📄 Lisensi
MIT License &bull; Dibuat untuk portofolio implementasi antarmuka SIMRS rawat jalan modern.
