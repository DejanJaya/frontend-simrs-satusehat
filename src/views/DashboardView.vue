<template>
  <div class="container-xl">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <div class="page-pretitle">Ringkasan Operasional</div>
        <h1 class="page-title">Dashboard Alur Klinik Rawat Jalan</h1>
      </div>
      <div>
        <router-link to="/pendaftaran" class="btn btn-primary">
          <span>+ Daftarkan Pasien Datang</span>
        </router-link>
      </div>
    </div>

    <!-- Visual Alur Pasien Simpel (4 Tahap) -->
    <div class="clinic-flow shadow-sm">
      <div class="clinic-flow-step" :class="{ active: stats.waiting > 0 }">
        <div class="step-badge">1</div>
        <div>
          <div class="fw-bold">Pasien Datang</div>
          <div class="text-muted" style="font-size: 0.75rem;">Pendaftaran & Antrean ({{ stats.waiting || 0 }})</div>
        </div>
      </div>
      <div class="clinic-flow-arrow">➔</div>

      <div class="clinic-flow-step" :class="{ active: stats.in_examination > 0 }">
        <div class="step-badge">2</div>
        <div>
          <div class="fw-bold">Diperiksa Dokter</div>
          <div class="text-muted" style="font-size: 0.75rem;">Pemeriksaan & Resep ({{ stats.in_examination || 0 }})</div>
        </div>
      </div>
      <div class="clinic-flow-arrow">➔</div>

      <div class="clinic-flow-step" :class="{ active: stats.in_pharmacy > 0 }">
        <div class="step-badge">3</div>
        <div>
          <div class="fw-bold">Ambil Obat</div>
          <div class="text-muted" style="font-size: 0.75rem;">Farmasi & Kasir ({{ stats.in_pharmacy || 0 }})</div>
        </div>
      </div>
      <div class="clinic-flow-arrow">➔</div>

      <div class="clinic-flow-step completed">
        <div class="step-badge">4</div>
        <div>
          <div class="fw-bold">Pulang</div>
          <div class="text-muted" style="font-size: 0.75rem;">Selesai Layanan ({{ stats.finished || 0 }})</div>
        </div>
      </div>
    </div>

    <!-- Metrik Statistik Harian -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card card-sm">
          <div class="card-status-top bg-primary"></div>
          <div class="card-body">
            <div class="text-muted">Total Kunjungan Hari Ini</div>
            <div class="h1 fw-bold mb-0 mt-1">{{ stats.total_today || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card card-sm">
          <div class="card-status-top bg-warning"></div>
          <div class="card-body">
            <div class="text-muted">1. Menunggu Diperiksa</div>
            <div class="h1 fw-bold mb-0 mt-1 text-warning">{{ stats.waiting || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card card-sm">
          <div class="card-status-top bg-info"></div>
          <div class="card-body">
            <div class="text-muted">2. Sedang Diperiksa</div>
            <div class="h1 fw-bold mb-0 mt-1 text-info">{{ stats.in_examination || 0 }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card card-sm">
          <div class="card-status-top bg-success"></div>
          <div class="card-body">
            <div class="text-muted">3 & 4. Farmasi / Selesai</div>
            <div class="h1 fw-bold mb-0 mt-1 text-success">{{ stats.finished || 0 }} Selesai</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Antrean Aktif Hari Ini -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title">Daftar Antrean Pasien Hari Ini</h3>
        <button class="btn btn-sm btn-light" @click="fetchData">🔄 Muat Ulang</button>
      </div>
      <div class="table-responsive">
        <table class="table table-vcenter table-hover">
          <thead>
            <tr>
              <th>No. Antrean</th>
              <th>No. Rekam Medis</th>
              <th>Nama Pasien</th>
              <th>Poli / Dokter</th>
              <th>Status Alur</th>
              <th>SATUSEHAT</th>
              <th>Aksi Cepat</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4 text-muted">Memuat data antrean...</td>
            </tr>
            <tr v-else-if="visits.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">Belum ada kunjungan pasien hari ini. Silakan daftarkan pasien.</td>
            </tr>
            <tr v-for="v in visits" :key="v.id">
              <td>
                <span class="badge bg-blue-lt" style="font-size: 0.9rem; font-weight: bold;">
                  {{ v.queue_number }}
                </span>
              </td>
              <td><code>{{ v.mr_number }}</code></td>
              <td>
                <div class="fw-bold">{{ v.patient_name }}</div>
                <div class="text-muted" style="font-size: 0.75rem;">NIK: {{ v.nik }}</div>
              </td>
              <td>
                <div>{{ v.location_name }}</div>
                <div class="text-muted" style="font-size: 0.75rem;">{{ v.doctor_name }}</div>
              </td>
              <td>
                <span v-if="v.status === 'MENUNGGU'" class="badge bg-yellow-lt">Menunggu Diperiksa</span>
                <span v-else-if="v.status === 'DIPERIKSA'" class="badge bg-blue-lt">Sedang Diperiksa</span>
                <span v-else-if="v.status === 'FARMASI'" class="badge bg-cyan-lt">Di Farmasi (Ambil Obat)</span>
                <span v-else-if="v.status === 'SELESAI'" class="badge bg-green-lt">Selesai (Pulang)</span>
                <span v-else class="badge">{{ v.status }}</span>
              </td>
              <td>
                <span v-if="v.satusehat_encounter_id" class="badge bg-green-lt" title="Encounter ID terdaftar">
                  ✓ {{ v.satusehat_status || 'Synced' }}
                </span>
                <span v-else class="badge bg-yellow-lt">Belum Sync</span>
              </td>
              <td>
                <router-link
                  v-if="v.status === 'MENUNGGU' || v.status === 'DIPERIKSA'"
                  :to="`/dokter/periksa/${v.id}`"
                  class="btn btn-sm btn-outline-primary"
                >
                  Periksa Dokter ➔
                </router-link>
                <router-link
                  v-else-if="v.status === 'FARMASI'"
                  to="/farmasi"
                  class="btn btn-sm btn-success"
                >
                  Proses Obat ➔
                </router-link>
                <span v-else class="text-success fw-bold" style="font-size: 0.8rem;">✓ Selesai</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../services/api';

export default {
  name: 'DashboardView',
  data() {
    return {
      loading: true,
      stats: {},
      visits: []
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [statsRes, visitsRes] = await Promise.all([
          api.getDashboard(),
          api.getTodayVisits()
        ]);
        this.stats = statsRes.data || {};
        this.visits = visitsRes.data || [];
      } catch (err) {
        console.error('Gagal mengambil data dashboard:', err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
