<template>
  <div class="container-xl">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <div class="page-pretitle">Tahap 2 Alur Klinik</div>
        <h1 class="page-title">🩺 Antrean Pemeriksaan Dokter</h1>
      </div>
      <button class="btn btn-light" @click="fetchVisits">🔄 Muat Ulang Antrean</button>
    </div>

    <div class="row g-3">
      <!-- Filter & Info Dokter -->
      <div class="col-12">
        <div class="card p-3 d-flex flex-row justify-content-between align-items-center">
          <div>
            <span class="text-muted">Status Ruang Praktik Dokter: </span>
            <span class="badge bg-green-lt fw-bold">ONLINE &bull; Siap Melayani Pasien</span>
          </div>
          <div class="text-muted" style="font-size: 0.85rem;">
            Pasien Menunggu: <strong class="text-primary">{{ visits.length }} orang</strong>
          </div>
        </div>
      </div>

      <!-- Tabel Antrean Dokter -->
      <div class="col-12">
        <div class="card">
          <div class="table-responsive">
            <table class="table table-vcenter table-hover">
              <thead>
                <tr>
                  <th>No. Antrean</th>
                  <th>Pasien</th>
                  <th>Poli & Dokter</th>
                  <th>Status</th>
                  <th>Catatan Pendaftaran</th>
                  <th class="text-end">Aksi Pemeriksaan</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="loading">
                  <td colspan="6" class="text-center py-4 text-muted">Memuat antrean dokter...</td>
                </tr>
                <tr v-else-if="visits.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    Tidak ada pasien dalam antrean pemeriksaan saat ini.
                  </td>
                </tr>
                <tr v-for="v in visits" :key="v.id">
                  <td>
                    <span class="badge bg-blue-lt" style="font-size: 1.1rem; font-weight: bold; padding: 0.4rem 0.8rem;">
                      {{ v.queue_number }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-bold fs-6">{{ v.patient_name }}</div>
                    <div class="text-muted" style="font-size: 0.8rem;">
                      <code>{{ v.mr_number }}</code> &bull; NIK: {{ v.nik }} &bull; {{ v.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                    </div>
                  </td>
                  <td>
                    <div>{{ v.location_name }}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">{{ v.doctor_name }}</div>
                  </td>
                  <td>
                    <span v-if="v.status === 'MENUNGGU'" class="badge bg-yellow-lt">Menunggu Panggilan</span>
                    <span v-else-if="v.status === 'DIPERIKSA'" class="badge bg-blue-lt">Sedang Diperiksa</span>
                    <span v-else class="badge">{{ v.status }}</span>
                  </td>
                  <td>
                    <span class="text-muted" style="font-size: 0.85rem;">{{ v.notes || '-' }}</span>
                  </td>
                  <td class="text-end">
                    <router-link :to="`/dokter/periksa/${v.id}`" class="btn btn-primary">
                      <span>🩺 Panggil & Periksa ➔</span>
                    </router-link>
                  </td>
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

export default {
  name: 'DoctorQueueView',
  data() {
    return {
      loading: true,
      visits: []
    };
  },
  mounted() {
    this.fetchVisits();
  },
  methods: {
    async fetchVisits() {
      this.loading = true;
      try {
        // Ambil kunjungan hari ini yang berstatus MENUNGGU atau DIPERIKSA
        const res = await api.getTodayVisits();
        this.visits = (res.data || []).filter(
          v => v.status === 'MENUNGGU' || v.status === 'DIPERIKSA'
        );
      } catch (err) {
        console.error('Gagal mengambil antrean dokter:', err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
