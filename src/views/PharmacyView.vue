<template>
  <div class="container-xl">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <div class="page-pretitle">Tahap 3 & 4 Alur Klinik</div>
        <h1 class="page-title">💊 Farmasi & Kasir (Ambil Obat ➔ Pulang)</h1>
      </div>
      <div class="d-flex gap-2">
        <button
          class="btn"
          :class="activeTab === 'prescriptions' ? 'btn-primary' : 'btn-light'"
          @click="activeTab = 'prescriptions'"
        >
          Resep Masuk ({{ pendingPrescriptions.length }})
        </button>
        <button
          class="btn"
          :class="activeTab === 'medicines' ? 'btn-primary' : 'btn-light'"
          @click="activeTab = 'medicines'"
        >
          Katalog Obat & Stok
        </button>
      </div>
    </div>

    <!-- Alert notifikasi -->
    <div v-if="alertMessage" :class="`alert alert-${alertType} d-flex justify-content-between align-items-center`">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn btn-sm btn-light" @click="alertMessage = ''">✕</button>
    </div>

    <!-- TAB 1: Resep Masuk / Menunggu Pengambilan Obat -->
    <div v-if="activeTab === 'prescriptions'">
      <div v-if="loading" class="text-center py-5 text-muted">Memuat daftar resep...</div>
      <div v-else-if="pendingPrescriptions.length === 0" class="card text-center py-5">
        <div class="card-body">
          <div style="font-size: 3rem;">🎉</div>
          <h3 class="fw-bold mt-2">Semua Resep Sudah Diproses</h3>
          <p class="text-muted">Tidak ada pasien yang sedang menunggu pengambilan obat saat ini.</p>
        </div>
      </div>
      <div v-else class="row g-3">
        <div v-for="pr in pendingPrescriptions" :key="pr.prescription_id" class="col-md-6">
          <div class="card shadow-sm border">
            <div class="card-status-top bg-cyan"></div>
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <span class="badge bg-blue-lt fw-bold me-2" style="font-size: 1rem;">{{ pr.queue_number }}</span>
                <span class="fw-bold">{{ pr.patient_name }}</span>
                <span class="text-muted ms-1" style="font-size: 0.8rem;">(RM: {{ pr.mr_number }})</span>
              </div>
              <span class="badge bg-yellow-lt">Menunggu Obat</span>
            </div>
            <div class="card-body">
              <div class="text-muted mb-2" style="font-size: 0.8rem;">
                Dokter: <strong>{{ pr.doctor_name }}</strong>
              </div>

              <!-- Daftar Item Obat -->
              <div class="table-responsive border rounded mb-3">
                <table class="table table-sm mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th>Nama Obat</th>
                      <th>Qty</th>
                      <th>Aturan Pakai</th>
                      <th class="text-end">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in pr.items" :key="item.id">
                      <td>
                        <div class="fw-bold">{{ item.medicine_name }}</div>
                        <div class="text-muted" style="font-size: 0.75rem;">Stok Tersedia: {{ item.current_stock }} {{ item.unit }}</div>
                      </td>
                      <td>{{ item.quantity }} {{ item.unit }}</td>
                      <td style="font-size: 0.8rem;">{{ item.dosage_instruction }}</td>
                      <td class="text-end">Rp {{ formatNumber(item.subtotal) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Rincian Biaya Kasir -->
              <div class="bg-light p-2 rounded mb-3" style="font-size: 0.85rem;">
                <div class="d-flex justify-content-between mb-1">
                  <span>Jasa Konsultasi / Tindakan Dokter:</span>
                  <span>Rp {{ formatNumber(pr.consultation_fee) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-1">
                  <span>Total Biaya Obat:</span>
                  <span>Rp {{ formatNumber(pr.medicine_fee) }}</span>
                </div>
                <div class="d-flex justify-content-between fw-bold pt-1 border-top" style="font-size: 1rem;">
                  <span>Total Pembayaran Pasien:</span>
                  <span class="text-primary">Rp {{ formatNumber(pr.total_amount) }}</span>
                </div>
              </div>

              <!-- Pilihan Metode Pembayaran Kasir -->
              <div class="d-flex align-items-center gap-2 mb-3">
                <label class="form-label mb-0" style="white-space: nowrap;">Metode Bayar:</label>
                <select v-model="paymentMethods[pr.visit_id]" class="form-select form-select-sm">
                  <option value="TUNAI">Tunai / Cash</option>
                  <option value="QRIS">QRIS</option>
                  <option value="TRANSFER">Transfer Bank</option>
                </select>
              </div>

              <!-- Tombol Aksi Penyelesaian Kunjungan -->
              <div class="d-flex gap-2">
                <button
                  class="btn btn-outline-primary w-50 py-2 fw-bold"
                  @click="printInvoice(pr)"
                >
                  🖨️ Cetak Kuitansi PDF
                </button>
                <button
                  class="btn btn-success w-50 py-2 fw-bold"
                  @click="dispenseMedication(pr.visit_id)"
                  :disabled="processingVisitId === pr.visit_id"
                >
                  {{ processingVisitId === pr.visit_id ? 'Memproses...' : '✓ Selesai & Pulang' }}
                </button>
              </div>
              <div class="text-center text-muted mt-2" style="font-size: 0.75rem;">
                Stok otomatis berkurang, status Encounter SATUSEHAT diperbarui menjadi <em>finished</em>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Katalog Master Obat & Tambah Stok -->
    <div v-else>
      <div class="card mb-3">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3 class="card-title">Katalog Obat Klinik</h3>
          <button class="btn btn-sm btn-primary" @click="showAddMedModal = !showAddMedModal">
            {{ showAddMedModal ? 'Tutup Form' : '+ Tambah Obat Baru' }}
          </button>
        </div>

        <!-- Form Tambah Obat Baru -->
        <div v-if="showAddMedModal" class="card-body bg-light border-bottom">
          <h4 class="fw-bold mb-3">Form Input Obat Baru</h4>
          <div class="row g-2 mb-2">
            <div class="col-md-3">
              <label class="form-label">Kode KFA (Kemenkes)</label>
              <input type="text" v-model="newMedicine.kfa_code" class="form-control" placeholder="93000xxx" />
            </div>
            <div class="col-md-5">
              <label class="form-label">Nama Obat & Dosis *</label>
              <input type="text" v-model="newMedicine.name" class="form-control" placeholder="Paracetamol 500 mg" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Bentuk Sediaan</label>
              <input type="text" v-model="newMedicine.form" class="form-control" placeholder="Tablet" />
            </div>
            <div class="col-md-2">
              <label class="form-label">Satuan</label>
              <input type="text" v-model="newMedicine.unit" class="form-control" placeholder="Tablet" />
            </div>
          </div>
          <div class="row g-2 mb-3">
            <div class="col-md-6">
              <label class="form-label">Stok Awal</label>
              <input type="number" v-model="newMedicine.stock" class="form-control" placeholder="100" />
            </div>
            <div class="col-md-6">
              <label class="form-label">Harga Satuan (Rp)</label>
              <input type="number" v-model="newMedicine.unit_price" class="form-control" placeholder="2000" />
            </div>
          </div>
          <button class="btn btn-primary" @click="saveNewMedicine">Simpan Obat ke Katalog</button>
        </div>

        <div class="table-responsive">
          <table class="table table-vcenter table-hover">
            <thead>
              <tr>
                <th>Kode KFA</th>
                <th>Nama Obat</th>
                <th>Bentuk & Satuan</th>
                <th>Sisa Stok</th>
                <th>Harga Satuan</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in medicines" :key="m.id">
                <td><code>{{ m.kfa_code || '-' }}</code></td>
                <td class="fw-bold">{{ m.name }}</td>
                <td>{{ m.form }} &bull; {{ m.unit }}</td>
                <td>
                  <span
                    class="badge"
                    :class="m.stock < 50 ? 'bg-red-lt' : 'bg-green-lt'"
                    style="font-size: 0.85rem;"
                  >
                    {{ m.stock }} {{ m.unit }}
                  </span>
                </td>
                <td>Rp {{ formatNumber(m.unit_price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Modal Cetak Kuitansi / Faktur Kasir PDF -->
    <div v-if="selectedInvoice" class="card mt-4 border-primary shadow printable-area">
      <div class="card-header d-flex justify-content-between align-items-center bg-light d-print-none">
        <h3 class="card-title">🖨️ Pratinjau Kuitansi Pembayaran Pasien</h3>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary" @click="triggerPrint">🖨️ Cetak / Download PDF</button>
          <button class="btn btn-sm btn-light" @click="selectedInvoice = null">✕ Tutup</button>
        </div>
      </div>
      <div class="card-body p-4" style="max-width: 800px; margin: auto;">
        <!-- Kop Surat Klinik -->
        <div class="text-center border-bottom pb-3 mb-3">
          <h2 class="fw-bold mb-0 text-primary">KLINIK PRATAMA RAWAT JALAN</h2>
          <div class="text-muted" style="font-size: 0.85rem;">
            Jl. Raya Kesehatan No. 10 &bull; Telp: (021) 8765-4321 &bull; Izin Fasyankes: KEMENKES-18f72a06
          </div>
          <div class="fw-bold text-uppercase mt-2" style="letter-spacing: 2px; font-size: 1.1rem; text-decoration: underline;">
            KUITANSI PEMBAYARAN RAWAT JALAN
          </div>
        </div>

        <!-- Info Pasien -->
        <div class="row mb-3" style="font-size: 0.85rem;">
          <div class="col-6">
            <div>No. Kuitansi: <strong>KW-{{ selectedInvoice.visit_number }}</strong></div>
            <div>No. Rekam Medis: <strong>{{ selectedInvoice.mr_number }}</strong></div>
            <div>Nama Pasien: <strong>{{ selectedInvoice.patient_name }}</strong></div>
          </div>
          <div class="col-6 text-end">
            <div>Tanggal: <strong>{{ selectedInvoice.visit_date }}</strong></div>
            <div>Dokter Pemeriksa: <strong>{{ selectedInvoice.doctor_name }}</strong></div>
            <div>No. Antrean: <span class="badge bg-blue-lt fw-bold">{{ selectedInvoice.queue_number }}</span></div>
          </div>
        </div>

        <!-- Tabel Rincian Biaya -->
        <div class="table-responsive mb-3">
          <table class="table table-bordered table-sm">
            <thead class="bg-light">
              <tr>
                <th>No</th>
                <th>Deskripsi Layanan / Obat</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Harga Satuan</th>
                <th class="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td>Jasa Konsultasi & Pemeriksaan Dokter</td>
                <td class="text-center">1</td>
                <td class="text-end">Rp {{ formatNumber(selectedInvoice.consultation_fee) }}</td>
                <td class="text-end">Rp {{ formatNumber(selectedInvoice.consultation_fee) }}</td>
              </tr>
              <tr v-for="(it, idx) in selectedInvoice.items" :key="it.id">
                <td class="text-center">{{ idx + 2 }}</td>
                <td>{{ it.medicine_name }} ({{ it.dosage_instruction }})</td>
                <td class="text-center">{{ it.quantity }} {{ it.unit }}</td>
                <td class="text-end">Rp {{ formatNumber(it.unit_price) }}</td>
                <td class="text-end">Rp {{ formatNumber(it.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="fw-bold" style="font-size: 1rem;">
                <td colspan="4" class="text-end">TOTAL TAGIHAN:</td>
                <td class="text-end text-primary">Rp {{ formatNumber(selectedInvoice.total_amount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Bagian Bawah: Status Lunas & Tanda Tangan -->
        <div class="row align-items-center mt-4">
          <div class="col-6">
            <div class="border border-success p-2 text-center rounded text-success fw-bold" style="border-width: 2px !important; font-size: 1.1rem; width: 180px;">
              ✓ LUNAS
            </div>
            <div class="text-muted mt-1" style="font-size: 0.75rem;">Metode: {{ paymentMethods[selectedInvoice.visit_id] || 'TUNAI' }}</div>
          </div>
          <div class="col-6 text-end">
            <div style="font-size: 0.85rem;">Petugas Kasir & Farmasi,</div>
            <div style="height: 50px;"></div>
            <div class="fw-bold" style="font-size: 0.85rem;">( Petugas Kasir Klinik )</div>
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
  name: 'PharmacyView',
  data() {
    return {
      activeTab: 'prescriptions',
      loading: true,
      pendingPrescriptions: [],
      medicines: [],
      paymentMethods: {},
      processingVisitId: null,
      selectedInvoice: null,
      alertMessage: '',
      alertType: 'success',

      showAddMedModal: false,
      newMedicine: {
        kfa_code: '',
        name: '',
        form: 'Tablet',
        unit: 'Tablet',
        stock: 100,
        unit_price: 2000
      }
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [prescRes, medsRes] = await Promise.all([
          api.getPendingPrescriptions(),
          api.getMedicines()
        ]);
        this.pendingPrescriptions = prescRes.data || [];
        this.medicines = medsRes.data || [];

        // Inisialisasi default payment method ke TUNAI
        this.pendingPrescriptions.forEach(p => {
          if (!this.paymentMethods[p.visit_id]) {
            this.paymentMethods[p.visit_id] = 'TUNAI';
          }
        });
      } catch (err) {
        console.error('Gagal mengambil data farmasi:', err);
      } finally {
        this.loading = false;
      }
    },
    formatNumber(num) {
      return Number(num || 0).toLocaleString('id-ID');
    },
    printInvoice(pr) {
      this.selectedInvoice = pr;
      this.$nextTick(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      });
    },
    triggerPrint() {
      window.print();
    },
    async dispenseMedication(visitId) {
      const confirmed = await showAlert.confirm(
        'Konfirmasi Penyerahan Obat',
        'Pastikan obat sudah disiapkan sesuai dosis dan pembayaran pasien telah diterima.',
        'Ya, Serahkan Obat & Selesai',
        'Batal'
      );
      if (!confirmed) return;

      this.processingVisitId = visitId;
      const paymentMethod = this.paymentMethods[visitId] || 'TUNAI';

      try {
        await api.dispenseAndComplete(visitId, paymentMethod);
        await showAlert.success(
          'Transaksi Selesai!',
          'Obat telah diserahkan, tagihan LUNAS, dan data MedicationDispense sukses terkirim ke SATUSEHAT Kemenkes.'
        );
        this.alertMessage = 'Obat berhasil diserahkan! Status pembayaran LUNAS dan kunjungan pasien SELESAI (Pasien Pulang).';
        this.alertType = 'success';
        await this.fetchData();
      } catch (err) {
        showAlert.error('Gagal Menyelesaikan Transaksi', err.message);
        this.alertMessage = err.message;
        this.alertType = 'danger';
      } finally {
        this.processingVisitId = null;
      }
    },
    async saveNewMedicine() {
      if (!this.newMedicine.name) {
        showAlert.warning('Data Belum Lengkap', 'Nama obat wajib diisi.');
        return;
      }
      try {
        await api.createMedicine(this.newMedicine);
        showAlert.success('Berhasil!', `Obat ${this.newMedicine.name} berhasil ditambahkan ke katalog.`);
        this.alertMessage = `Obat ${this.newMedicine.name} berhasil ditambahkan ke katalog.`;
        this.alertType = 'success';
        this.showAddMedModal = false;
        this.newMedicine = { kfa_code: '', name: '', form: 'Tablet', unit: 'Tablet', stock: 100, unit_price: 2000 };
        const medsRes = await api.getMedicines();
        this.medicines = medsRes.data || [];
      } catch (err) {
        this.alertMessage = err.message;
        this.alertType = 'danger';
      }
    }
  }
};
</script>
