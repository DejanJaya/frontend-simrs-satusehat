<template>
  <div class="container-xl" v-if="visit">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <div class="page-pretitle">Tahap 2 Alur Klinik</div>
        <h1 class="page-title">🩺 Pemeriksaan Medis Dokter & E-Resep</h1>
      </div>
      <div>
        <router-link to="/dokter" class="btn btn-light">← Kembali ke Antrean</router-link>
      </div>
    </div>

    <!-- Alert notifikasi -->
    <div v-if="alertMessage" :class="`alert alert-${alertType} d-flex justify-content-between align-items-center`">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn btn-sm btn-light" @click="alertMessage = ''">✕</button>
    </div>

    <!-- Header Ringkasan Pasien & Kunjungan -->
    <div class="card mb-3">
      <div class="card-status-top bg-primary"></div>
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-2 text-center border-end">
            <div class="text-muted" style="font-size: 0.75rem;">Nomor Antrean</div>
            <div class="h1 fw-bold text-primary mb-0">{{ visit.queue_number }}</div>
            <span class="badge bg-blue-lt mt-1">{{ visit.status }}</span>
          </div>
          <div class="col-md-6 border-end ps-3">
            <h3 class="fw-bold mb-1">{{ visit.patient_name }}</h3>
            <div class="text-muted" style="font-size: 0.85rem;">
              No. RM: <code>{{ visit.mr_number }}</code> &bull; NIK: {{ visit.nik }} &bull;
              Gender: {{ visit.gender === 'male' ? 'Laki-laki' : 'Perempuan' }} &bull;
              Lahir: {{ visit.birth_date }}
            </div>
            <div class="text-muted mt-1" style="font-size: 0.85rem;">
              Alamat: {{ visit.address || '-' }}
            </div>
          </div>
          <div class="col-md-4 ps-3">
            <div class="text-muted" style="font-size: 0.75rem;">Poli / Dokter:</div>
            <div class="fw-bold">{{ visit.location_name }} &bull; {{ visit.doctor_name }}</div>
            <div class="mt-2">
              <span v-if="visit.satusehat_encounter_id" class="badge bg-green-lt">
                ✓ SATUSEHAT Encounter: {{ visit.satusehat_encounter_id }}
              </span>
              <span v-else class="badge bg-yellow-lt">SATUSEHAT: Menunggu Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Pemeriksaan Medis -->
    <div class="row g-3">
      <!-- Sisi Kiri: Rekam Medis & Diagnosa -->
      <div class="col-md-7">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">1. Anamnesis & Tanda Vital</h3>
          </div>
          <div class="card-body">
            <!-- Keluhan Utama -->
            <div class="mb-3">
              <label class="form-label">Anamnesis / Keluhan Utama Pasien *</label>
              <textarea
                v-model="form.chief_complaint"
                rows="3"
                class="form-control"
                placeholder="Contoh: Pasien mengeluh demam sejak 2 hari, batuk berdahak, dan badan pegal..."
              ></textarea>
            </div>

            <!-- Tanda Vital -->
            <label class="form-label fw-bold">Tanda-Tanda Vital (Vital Signs)</label>
            <div class="row g-2 mb-3">
              <div class="col-6 col-md-3">
                <label class="form-label" style="font-size: 0.75rem;">Sistolik (mmHg)</label>
                <input type="number" v-model="form.systolic" class="form-control" placeholder="120" />
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label" style="font-size: 0.75rem;">Diastolik (mmHg)</label>
                <input type="number" v-model="form.diastolic" class="form-control" placeholder="80" />
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label" style="font-size: 0.75rem;">Nadi (bpm)</label>
                <input type="number" v-model="form.heart_rate" class="form-control" placeholder="80" />
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label" style="font-size: 0.75rem;">Suhu (°C)</label>
                <input type="number" step="0.1" v-model="form.temperature" class="form-control" placeholder="36.5" />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Pemeriksaan Fisik Tambahan</label>
              <input
                type="text"
                v-model="form.physical_exam"
                class="form-control"
                placeholder="Contoh: Tenggorokan hiperemis, ronki -/-, wheezing -/-"
              />
            </div>

            <hr />
            <h3 class="card-title mb-2">2. Diagnosa Penyakit (ICD-10)</h3>
            <p class="text-muted" style="font-size: 0.8rem;">
              Pilih dari diagnosa klinis umum atau input kode ICD-10 yang sesuai standar SATUSEHAT.
            </p>

            <!-- Pilihan Cepat ICD-10 -->
            <div class="d-flex flex-wrap gap-1 mb-3">
              <button
                type="button"
                v-for="item in commonIcd10"
                :key="item.code"
                class="btn btn-sm"
                :class="form.icd10_code === item.code ? 'btn-primary' : 'btn-light'"
                @click="selectIcd10(item)"
              >
                {{ item.code }} - {{ item.display }}
              </button>
            </div>

            <div class="row g-2 mb-3">
              <div class="col-md-4">
                <label class="form-label">Kode ICD-10 *</label>
                <input type="text" v-model="form.icd10_code" class="form-control" placeholder="J00" />
              </div>
              <div class="col-md-8">
                <label class="form-label">Nama Diagnosa ICD-10 *</label>
                <input type="text" v-model="form.icd10_display" class="form-control" placeholder="Acute nasopharyngitis [common cold]" />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Catatan Tindakan Medis / Edukasi Pasien</label>
              <textarea
                v-model="form.treatment_notes"
                rows="2"
                class="form-control"
                placeholder="Edukasi istirahat cukup, minum air putih 2 liter per hari..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- Sisi Kanan: E-Resep Obat -->
      <div class="col-md-5">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h3 class="card-title">3. E-Resep Obat (Untuk Farmasi)</h3>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="addPrescriptionItem">
              + Tambah Obat
            </button>
          </div>
          <div class="card-body">
            <div v-if="form.prescriptions.length === 0" class="text-center py-4 text-muted border rounded">
              Belum ada obat yang diresepkan.<br />Klik <strong>"+ Tambah Obat"</strong> jika pasien memerlukan obat.
            </div>

            <div
              v-for="(item, index) in form.prescriptions"
              :key="index"
              class="border rounded p-2 mb-2 bg-light position-relative"
            >
              <div class="d-flex justify-content-between align-items-center mb-1">
                <strong style="font-size: 0.8rem;">Obat #{{ index + 1 }}</strong>
                <button
                  type="button"
                  class="btn btn-sm text-danger p-0"
                  style="border: none; background: transparent; font-size: 0.8rem;"
                  @click="removePrescriptionItem(index)"
                >
                  ✕ Hapus
                </button>
              </div>

              <div class="mb-2">
                <label class="form-label" style="font-size: 0.75rem;">Pilih Obat</label>
                <select v-model="item.medicine_id" class="form-select form-select-sm">
                  <option value="">-- Pilih Obat dari Katalog --</option>
                  <option v-for="m in medicines" :key="m.id" :value="m.id">
                    {{ m.name }} (Stok: {{ m.stock }} {{ m.unit }}) - Rp {{ formatNumber(m.unit_price) }}
                  </option>
                </select>
              </div>

              <div class="row g-2">
                <div class="col-4">
                  <label class="form-label" style="font-size: 0.75rem;">Jumlah</label>
                  <input
                    type="number"
                    min="1"
                    v-model="item.quantity"
                    class="form-control form-control-sm"
                    placeholder="10"
                  />
                </div>
                <div class="col-8">
                  <label class="form-label" style="font-size: 0.75rem;">Aturan Pakai</label>
                  <input
                    type="text"
                    v-model="item.dosage_instruction"
                    class="form-control form-control-sm"
                    placeholder="3 x 1 tablet sesudah makan"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button
              type="button"
              class="btn btn-outline-primary w-100 py-1 mb-2 fw-bold"
              @click="triggerPrint"
            >
              🖨️ Cetak / Simpan PDF Lembar Resep
            </button>
            <button
              class="btn btn-success w-100 py-2 fw-bold"
              @click="submitExamination"
              :disabled="saving"
            >
              {{ saving ? 'Menyimpan & Mengirim SATUSEHAT...' : '✓ Selesai Pemeriksaan ➔ Kirim ke Farmasi' }}
            </button>
            <div class="text-center text-muted mt-2" style="font-size: 0.75rem;">
              Data otomatis dikirim ke SATUSEHAT: Encounter, Condition, Observation, & MedicationRequest.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="container-xl py-5 text-center text-muted">
    Memuat data pasien...
  </div>
</template>

<script>
import { api } from '../services/api';
import { showAlert } from '../utils/alert';

export default {
  name: 'DoctorExaminationView',
  data() {
    return {
      visitId: this.$route.params.id,
      loading: true,
      saving: false,
      visit: null,
      medicines: [],
      alertMessage: '',
      alertType: 'success',

      commonIcd10: [
        { code: 'J00', display: 'Acute nasopharyngitis [common cold]' },
        { code: 'A09', display: 'Infectious gastroenteritis and colitis, unspecified' },
        { code: 'I10', display: 'Essential (primary) hypertension' },
        { code: 'K29.7', display: 'Gastritis, unspecified' },
        { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications' },
        { code: 'R50.9', display: 'Fever, unspecified' }
      ],

      form: {
        chief_complaint: '',
        physical_exam: '',
        systolic: 120,
        diastolic: 80,
        heart_rate: 80,
        temperature: 36.5,
        respiratory_rate: 18,
        icd10_code: 'J00',
        icd10_display: 'Acute nasopharyngitis [common cold]',
        treatment_notes: '',
        prescriptions: []
      }
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const [visitRes, medsRes, recordRes] = await Promise.all([
          api.getVisitById(this.visitId),
          api.getMedicines(),
          api.getMedicalRecord(this.visitId).catch(() => ({ data: null }))
        ]);

        this.visit = visitRes.data;
        this.medicines = medsRes.data || [];

        // Jika sudah ada pemeriksaan tersimpan sebelumnya
        if (recordRes.data) {
          const r = recordRes.data;
          this.form.chief_complaint = r.chief_complaint || '';
          this.form.physical_exam = r.physical_exam || '';
          this.form.systolic = r.systolic || 120;
          this.form.diastolic = r.diastolic || 80;
          this.form.heart_rate = r.heart_rate || 80;
          this.form.temperature = r.temperature || 36.5;
          this.form.icd10_code = r.icd10_code || 'J00';
          this.form.icd10_display = r.icd10_display || '';
          this.form.treatment_notes = r.treatment_notes || '';

          if (r.prescriptions && r.prescriptions.length > 0) {
            this.form.prescriptions = r.prescriptions.map(p => ({
              medicine_id: p.medicine_id,
              quantity: p.quantity,
              dosage_instruction: p.dosage_instruction
            }));
          }
        } else {
          // Default 1 resep kosong jika belum ada
          this.addPrescriptionItem();
        }

        // Tandai status kunjungan sedang diperiksa jika masih menunggu
        if (this.visit.status === 'MENUNGGU') {
          await api.updateVisitStatus(this.visitId, 'DIPERIKSA');
          this.visit.status = 'DIPERIKSA';
        }
      } catch (err) {
        this.alertMessage = err.message;
        this.alertType = 'danger';
      } finally {
        this.loading = false;
      }
    },
    selectIcd10(item) {
      this.form.icd10_code = item.code;
      this.form.icd10_display = item.display;
    },
    addPrescriptionItem() {
      const defaultMedId = this.medicines.length > 0 ? this.medicines[0].id : '';
      this.form.prescriptions.push({
        medicine_id: defaultMedId,
        quantity: 10,
        dosage_instruction: '3 x 1 tablet sesudah makan'
      });
    },
    removePrescriptionItem(index) {
      this.form.prescriptions.splice(index, 1);
    },
    triggerPrint() {
      window.print();
    },
    formatNumber(num) {
      return Number(num || 0).toLocaleString('id-ID');
    },
    async submitExamination() {
      if (!this.form.chief_complaint.trim()) {
        showAlert.warning('Data Belum Lengkap', 'Mohon isi Anamnesis / Keluhan Utama Pasien.');
        return;
      }
      if (!this.form.icd10_code || !this.form.icd10_display) {
        showAlert.warning('Diagnosa Diperlukan', 'Mohon tentukan Diagnosa ICD-10.');
        return;
      }

      const confirmed = await showAlert.confirm(
        'Selesai Pemeriksaan?',
        'Data pemeriksaan, diagnosa ICD-10, tanda vital, dan e-resep akan dikirim ke SATUSEHAT dan diteruskan ke Farmasi.',
        'Ya, Kirim ke Farmasi',
        'Cek Kembali'
      );
      if (!confirmed) return;

      this.saving = true;
      try {
        await api.saveMedicalRecord({
          visit_id: this.visitId,
          ...this.form
        });

        await showAlert.success(
          'Pemeriksaan Berhasil Disimpan!',
          'Data berhasil dikirim ke SATUSEHAT Kemenkes. Pasien diteruskan ke bagian Farmasi untuk pengambilan obat.'
        );

        this.$router.push('/farmasi');
      } catch (err) {
        showAlert.error('Gagal Menyimpan Pemeriksaan', err.message);
        this.alertMessage = err.message;
        this.alertType = 'danger';
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>
