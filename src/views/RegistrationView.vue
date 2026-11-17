<template>
  <div class="container-xl">
    <div class="page-header">
      <div class="page-pretitle">Tahap 1 Alur Klinik</div>
      <h1 class="page-title">🚶 Pasien Datang (Pendaftaran & Antrean)</h1>
    </div>

    <!-- Alert notifikasi -->
    <div v-if="alertMessage" :class="`alert alert-${alertType} d-flex justify-content-between align-items-center`">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn btn-sm btn-light" @click="alertMessage = ''">✕</button>
    </div>

    <div class="row g-3">
      <!-- Kolom Kiri: Form Pendaftaran Kunjungan Pasien -->
      <div class="col-md-7">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="card-title">Registrasi Kunjungan Pasien Baru / Lama</h3>
            <div class="d-flex gap-2">
              <button
                class="btn btn-sm"
                :class="mode === 'existing' ? 'btn-primary' : 'btn-light'"
                @click="mode = 'existing'"
              >
                Pasien Terdaftar
              </button>
              <button
                class="btn btn-sm"
                :class="mode === 'new' ? 'btn-primary' : 'btn-light'"
                @click="mode = 'new'"
              >
                + Pasien Baru
              </button>
            </div>
          </div>
          <div class="card-body">
            <!-- Mode 1: Cari Pasien yang Sudah Terdaftar -->
            <div v-if="mode === 'existing'">
              <div class="mb-3">
                <label class="form-label">Cari Pasien (Nama / NIK / No. RM)</label>
                <div class="d-flex gap-2">
                  <input
                    type="text"
                    v-model="searchKeyword"
                    class="form-control"
                    placeholder="Masukkan nama, NIK, atau RM..."
                    @keyup.enter="searchPatient"
                  />
                  <button class="btn btn-primary" @click="searchPatient" :disabled="searching">
                    {{ searching ? 'Mencari...' : 'Cari' }}
                  </button>
                </div>
              </div>

              <!-- Hasil Pencarian Pasien -->
              <div v-if="patientResults.length > 0" class="table-responsive mb-3 border rounded">
                <table class="table table-sm table-hover mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th>Pilih</th>
                      <th>No. RM</th>
                      <th>Nama & NIK</th>
                      <th>IHS SATUSEHAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="p in patientResults"
                      :key="p.id"
                      :class="{ 'bg-blue-lt': selectedPatient && selectedPatient.id === p.id }"
                      style="cursor: pointer;"
                      @click="selectPatient(p)"
                    >
                      <td>
                        <input
                          type="radio"
                          name="selected_patient"
                          :checked="selectedPatient && selectedPatient.id === p.id"
                        />
                      </td>
                      <td><code>{{ p.mr_number }}</code></td>
                      <td>
                        <div class="fw-bold">{{ p.full_name }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">NIK: {{ p.nik }}</div>
                      </td>
                      <td>
                        <span v-if="p.satusehat_patient_id" class="badge bg-green-lt">
                          ✓ {{ p.satusehat_patient_id }}
                        </span>
                        <span v-else class="badge bg-yellow-lt">Belum Ada</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="selectedPatient" class="alert alert-info py-2 mb-3">
                <strong>Pasien Terpilih:</strong> {{ selectedPatient.full_name }} ({{ selectedPatient.mr_number }}) - NIK: {{ selectedPatient.nik }}
              </div>
            </div>

            <!-- Mode 2: Input Pasien Baru & Validasi SATUSEHAT -->
            <div v-else>
              <div class="row g-2 mb-1">
                <div class="col-md-8">
                  <label class="form-label">NIK (16 Digit) *</label>
                  <input
                    type="text"
                    v-model="newPatient.nik"
                    maxlength="16"
                    class="form-control"
                    placeholder="Contoh NIK Sandbox: 1000000000000001"
                  />
                </div>
                <div class="col-md-4 d-flex align-items-end">
                  <button
                    class="btn btn-outline-primary w-100"
                    @click="checkSatusehat"
                    :disabled="checkingIhs || !newPatient.nik"
                  >
                    {{ checkingIhs ? 'Cek...' : '🇮🇩 Cek IHS' }}
                  </button>
                </div>
              </div>

              <!-- Quick Click NIK Sandbox SATUSEHAT -->
              <div class="mb-3">
                <div class="text-muted" style="font-size: 0.72rem; margin-bottom: 3px;">
                  Pilih NIK Sandbox SATUSEHAT aktif (Klik untuk isi & verifikasi otomatis):
                </div>
                <div class="d-flex flex-wrap gap-1">
                  <button
                    v-for="dNik in demoNiks"
                    :key="dNik"
                    type="button"
                    class="badge bg-blue-lt border text-decoration-none"
                    style="cursor: pointer; padding: 3px 6px;"
                    @click="setDemoNik(dNik)"
                  >
                    {{ dNik }}
                  </button>
                </div>
              </div>

              <div v-if="ihsResult" class="alert alert-success py-1 mb-2" style="font-size: 0.8rem;">
                ✓ Terverifikasi SATUSEHAT: IHS Pasien <strong>{{ ihsResult.ihsNumber }}</strong>
              </div>

              <div class="mb-2">
                <label class="form-label">Nama Lengkap Pasien *</label>
                <input
                  type="text"
                  v-model="newPatient.full_name"
                  class="form-control"
                  placeholder="Nama sesuai KTP"
                />
              </div>

              <div class="row g-2 mb-2">
                <div class="col-md-6">
                  <label class="form-label">Tanggal Lahir *</label>
                  <input type="date" v-model="newPatient.birth_date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Jenis Kelamin *</label>
                  <select v-model="newPatient.gender" class="form-select">
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-md-6">
                  <label class="form-label">No. Handphone / WhatsApp</label>
                  <input
                    type="text"
                    v-model="newPatient.phone_number"
                    class="form-control"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Alamat Lengkap</label>
                  <input
                    type="text"
                    v-model="newPatient.address"
                    class="form-control"
                    placeholder="Alamat domisili"
                  />
                </div>
              </div>
            </div>

            <!-- Pilih Poli & Dokter Tujuan -->
            <hr />
            <h4 class="card-title mb-3">Tujuan Kunjungan Rawat Jalan</h4>

            <div class="row g-2 mb-3">
              <div class="col-md-6">
                <label class="form-label">Poli / Unit Layanan *</label>
                <select v-model="selectedLocationId" class="form-select">
                  <option value="">-- Pilih Poli --</option>
                  <option v-for="loc in locations" :key="loc.id" :value="loc.id">
                    {{ loc.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Dokter Pemeriksa *</label>
                <select v-model="selectedDoctorId" class="form-select">
                  <option value="">-- Pilih Dokter --</option>
                  <option v-for="doc in doctors" :key="doc.id" :value="doc.id">
                    {{ doc.full_name }} ({{ doc.specialization }})
                  </option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Catatan Tambahan (Opsional)</label>
              <textarea
                v-model="visitNotes"
                class="form-control"
                rows="2"
                placeholder="Keluhan singkat saat registrasi..."
              ></textarea>
            </div>

            <button
              class="btn btn-primary w-100 py-2 fw-bold"
              @click="submitRegistration"
              :disabled="submitting"
            >
              {{ submitting ? 'Memproses Pendaftaran & Antrean...' : '✓ Cetak Nomor Antrean & Daftarkan Kunjungan' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Tiket Antrean & Daftar Antrean Masuk -->
      <div class="col-md-5">
        <!-- Kartu Antrean Terakhir Dibuat -->
        <div v-if="lastVisit" class="card border-primary mb-3">
          <div class="card-status-top bg-primary"></div>
          <div class="card-body text-center py-4">
            <span class="badge bg-green-lt mb-2">Nomor Antrean Diterbitkan</span>
            <div class="display-3 fw-bold text-primary my-2" style="font-size: 3.5rem;">
              {{ lastVisit.queue_number }}
            </div>
            <div class="h3 fw-bold mb-1">{{ lastPatientName }}</div>
            <div class="text-muted">{{ lastVisit.visit_number }}</div>
            <div class="mt-3">
              <span class="badge bg-blue-lt">
                Encounter SATUSEHAT: {{ lastVisit.satusehat_encounter_id || 'Dalam Antrean' }}
              </span>
            </div>
            <div class="mt-3">
              <button class="btn btn-outline-primary btn-sm w-100" @click="printQueueTicket">
                🖨️ Cetak / Simpan PDF Tiket Antrean
              </button>
            </div>
          </div>
        </div>

        <!-- Daftar Pasien yang Mengantre Hari Ini -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Antrean Hari Ini (Status: Menunggu)</h3>
          </div>
          <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
            <table class="table table-sm table-vcenter">
              <thead>
                <tr>
                  <th>Antrean</th>
                  <th>Nama Pasien</th>
                  <th>Poli</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="waitingVisits.length === 0">
                  <td colspan="3" class="text-center py-3 text-muted">Belum ada antrean menunggu</td>
                </tr>
                <tr v-for="wv in waitingVisits" :key="wv.id">
                  <td>
                    <span class="badge bg-blue-lt fw-bold">{{ wv.queue_number }}</span>
                  </td>
                  <td>
                    <div class="fw-bold">{{ wv.patient_name }}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">RM: {{ wv.mr_number }}</div>
                  </td>
                  <td>{{ wv.location_name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../services/api';
import { showAlert } from '../utils/alert';

export default {
  name: 'RegistrationView',
  data() {
    return {
      mode: 'existing',
      searchKeyword: '',
      searching: false,
      patientResults: [],
      selectedPatient: null,

      // Form pasien baru
      newPatient: {
        nik: '',
        full_name: '',
        birth_date: '',
        gender: 'male',
        address: '',
        phone_number: ''
      },
      checkingIhs: false,
      ihsResult: null,
      demoNiks: [
        '1000000000000001',
        '1000000000000003',
        '1000000000000004',
        '1000000000000005',
        '1000000000000007',
        '1000000000000008',
        '1000000000000010',
        '1000000000000015',
        '1000000000000020'
      ],

      // Form kunjungan
      doctors: [],
      locations: [],
      selectedDoctorId: '',
      selectedLocationId: '',
      visitNotes: '',
      submitting: false,

      // Feedback
      alertMessage: '',
      alertType: 'success',
      lastVisit: null,
      lastPatientName: '',
      waitingVisits: []
    };
  },
  async mounted() {
    await this.loadInitialData();
  },
  methods: {
    async loadInitialData() {
      try {
        const [docsRes, locsRes, queueRes] = await Promise.all([
          api.getDoctors(),
          api.getLocations(),
          api.getTodayVisits('MENUNGGU')
        ]);
        this.doctors = docsRes.data || [];
        this.locations = locsRes.data || [];
        this.waitingVisits = queueRes.data || [];

        if (this.locations.length > 0) this.selectedLocationId = this.locations[0].id;
        if (this.doctors.length > 0) this.selectedDoctorId = this.doctors[0].id;
      } catch (err) {
        console.error('Gagal memuat master data:', err);
      }
    },
    async searchPatient() {
      if (!this.searchKeyword.trim()) return;
      this.searching = true;
      try {
        const res = await api.getPatients(this.searchKeyword);
        this.patientResults = res.data || [];
        if (this.patientResults.length === 0) {
          this.alertMessage = 'Pasien tidak ditemukan. Anda dapat mendaftarkan sebagai Pasien Baru.';
          this.alertType = 'warning';
        }
      } catch (err) {
        this.alertMessage = err.message;
        this.alertType = 'danger';
      } finally {
        this.searching = false;
      }
    },
    selectPatient(patient) {
      this.selectedPatient = patient;
    },
    setDemoNik(nik) {
      this.newPatient.nik = nik;
      if (!this.newPatient.birth_date) {
        this.newPatient.birth_date = '1992-05-15';
      }
      if (!this.newPatient.address) {
        this.newPatient.address = 'Jl. Sehat Bersama No. 12, Jakarta';
      }
      this.checkSatusehat();
    },
    async checkSatusehat() {
      if (!this.newPatient.nik) return;
      this.checkingIhs = true;
      this.ihsResult = null;
      try {
        const res = await api.checkSatusehatNik(this.newPatient.nik);
        this.ihsResult = res.data;
        if (res.data) {
          if (res.data.name) this.newPatient.full_name = res.data.name;
          if (res.data.birthDate) this.newPatient.birth_date = res.data.birthDate;
          if (res.data.gender) this.newPatient.gender = res.data.gender;
        }
      } catch (err) {
        this.alertMessage = `Lookup SATUSEHAT: ${err.message}`;
        this.alertType = 'warning';
      } finally {
        this.checkingIhs = false;
      }
    },
    async submitRegistration() {
      let patientId = null;
      let patientName = '';

      if (this.mode === 'existing') {
        if (!this.selectedPatient) {
          showAlert.warning('Pilih Pasien', 'Silakan cari dan pilih pasien terlebih dahulu dari tabel.');
          return;
        }
        patientId = this.selectedPatient.id;
        patientName = this.selectedPatient.full_name;
      } else {
        if (!this.newPatient.nik || !this.newPatient.full_name || !this.newPatient.birth_date) {
          showAlert.warning('Data Belum Lengkap', 'Mohon lengkapi NIK, Nama Lengkap, dan Tanggal Lahir Pasien.');
          return;
        }
        this.submitting = true;
        try {
          const createRes = await api.createPatient(this.newPatient);
          patientId = createRes.data.id;
          patientName = createRes.data.full_name;
        } catch (err) {
          showAlert.error('Gagal Registrasi Pasien', err.message);
          this.alertMessage = err.message;
          this.alertType = 'danger';
          this.submitting = false;
          return;
        }
      }

      if (!this.selectedDoctorId || !this.selectedLocationId) {
        showAlert.warning('Pilih Poli & Dokter', 'Silakan pilih Poli dan Dokter tujuan kunjungan.');
        this.submitting = false;
        return;
      }

      this.submitting = true;
      try {
        const visitRes = await api.createVisit({
          patient_id: patientId,
          doctor_id: this.selectedDoctorId,
          location_id: this.selectedLocationId,
          notes: this.visitNotes
        });

        this.lastVisit = visitRes.data;
        this.lastPatientName = patientName;
        
        await showAlert.success(
          'Nomor Antrean Diterbitkan!',
          `Pasien ${patientName} berhasil didaftarkan dengan nomor antrean ${visitRes.data.queue_number}. Data Encounter terkirim ke SATUSEHAT.`
        );
        this.alertMessage = `Pendaftaran berhasil! Nomor Antrean: ${visitRes.data.queue_number}`;
        this.alertType = 'success';

        // Refresh antrean
        const queueRes = await api.getTodayVisits('MENUNGGU');
        this.waitingVisits = queueRes.data || [];

        // Reset form
        this.selectedPatient = null;
        this.newPatient = { nik: '', full_name: '', birth_date: '', gender: 'male', address: '', phone_number: '' };
        this.ihsResult = null;
        this.visitNotes = '';
      } catch (err) {
        this.alertMessage = err.message;
        this.alertType = 'danger';
      } finally {
        this.submitting = false;
      }
    },
    printQueueTicket() {
      window.print();
    }
  }
};
</script>
