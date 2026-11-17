<template>
  <div class="container-xl">
    <div class="page-header d-flex flex-wrap justify-content-between align-items-center gap-2">
      <div>
        <div class="page-pretitle">Kemenkes RI Integrasi</div>
        <h1 class="page-title d-flex align-items-center gap-2">
          <span>🇮🇩</span>
          <span>Monitoring Integrasi SATUSEHAT (HL7 FHIR)</span>
        </h1>
      </div>
      <button class="btn btn-light" @click="fetchData">🔄 Muat Ulang Status & Log</button>
    </div>

    <!-- Status Koneksi SATUSEHAT -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card p-3 h-100">
          <div class="text-muted" style="font-size: 0.8rem;">Status Autentikasi OAuth2</div>
          <div class="d-flex align-items-center gap-2 mt-1">
            <span class="badge" :class="status.authConnected ? 'bg-green-lt' : 'bg-yellow-lt'" style="font-size: 0.95rem;">
              {{ status.authConnected ? '● Terhubung / Valid' : '○ Standby / Simulasi' }}
            </span>
            <span class="badge bg-blue-lt">{{ status.environment || 'staging' }}</span>
          </div>
          <div class="text-muted mt-2" style="font-size: 0.75rem;">
            Organization ID: <code>{{ status.orgId || '18f72a06-417c-4467-b397-ba58a1dfff37' }}</code>
          </div>
        </div>
      </div>

      <div class="col-md-8">
        <div class="card p-3 h-100">
          <div class="text-muted mb-1" style="font-size: 0.8rem;">Alur Resource HL7 FHIR yang Terhubung Otomatis</div>
          <!-- Flex Wrap Badges (Responsif, Tidak Melewati Card) -->
          <div class="d-flex flex-wrap gap-2 mt-1" style="line-height: 1.8;">
            <span class="badge bg-blue-lt p-2">1. Patient (Lookup NIK)</span>
            <span class="badge bg-blue-lt p-2">2. Practitioner (IHS Dokter)</span>
            <span class="badge bg-blue-lt p-2">3. Encounter (Kunjungan)</span>
            <span class="badge bg-blue-lt p-2">4. Condition (Diagnosa ICD-10)</span>
            <span class="badge bg-blue-lt p-2">5. Observation (Tanda Vital)</span>
            <span class="badge bg-blue-lt p-2">6. MedicationRequest (Resep)</span>
            <span class="badge bg-blue-lt p-2">7. MedicationDispense (Penyerahan Obat)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabel Riwayat Log Transaksi SATUSEHAT -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title">Riwayat Sinkronisasi FHIR Terbaru</h3>
        <div class="text-muted" style="font-size: 0.8rem;">Total: {{ logs.length }} transaksi</div>
      </div>
      <div class="table-responsive">
        <table class="table table-vcenter table-hover mb-0">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Resource FHIR</th>
              <th>Resource ID</th>
              <th>Endpoint SATUSEHAT</th>
              <th>HTTP Status</th>
              <th>Status Sinkronisasi</th>
              <th class="text-center">Aksi Detail</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4 text-muted">Memuat log sinkronisasi...</td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="7" class="text-center py-4 text-muted">
                Belum ada transaksi pengiriman FHIR. Jalankan alur pendaftaran, periksa dokter, atau farmasi untuk menguji sinkronisasi.
              </td>
            </tr>
            
            <!-- Loop Log Rows dengan Dropdown/Expand Row Tepat di Bawahnya -->
            <template v-for="log in logs" :key="log.id">
              <tr :class="{ 'bg-blue-lt': expandedLogId === log.id }">
                <td style="font-size: 0.8rem; white-space: nowrap;">
                  {{ formatDateTime(log.created_at) }}
                </td>
                <td>
                  <span class="badge bg-blue-lt fw-bold">{{ log.resource_type }}</span>
                </td>
                <td><code>{{ log.resource_id || '-' }}</code></td>
                <td><span style="font-size: 0.8rem;">{{ log.endpoint }}</span></td>
                <td>
                  <span
                    class="badge"
                    :class="log.http_status >= 200 && log.http_status < 300 ? 'bg-green-lt' : 'bg-red-lt'"
                  >
                    HTTP {{ log.http_status || 200 }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="log.sync_status === 'SUCCESS' ? 'bg-green-lt' : 'bg-red-lt'"
                  >
                    {{ log.sync_status }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm"
                    :class="expandedLogId === log.id ? 'btn-primary' : 'btn-light'"
                    @click="toggleExpand(log.id)"
                    style="font-size: 0.78rem;"
                  >
                    {{ expandedLogId === log.id ? '▲ Tutup' : '▼ Payload' }}
                  </button>
                </td>
              </tr>

              <!-- INLINE EXPANDED ROW (Muncul Tepat di Bawah Baris yang Diklik) -->
              <tr v-if="expandedLogId === log.id" :key="'detail-' + log.id">
                <td colspan="7" class="p-3" style="background-color: #f8fafc; border-top: 1px dashed #cbd5e1; border-bottom: 2px solid #206bc4;">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="fw-bold text-primary" style="font-size: 0.88rem;">
                      📦 Detail Payload FHIR: <code>{{ log.resource_type }} / {{ log.resource_id || '-' }}</code>
                    </div>
                    <button class="btn btn-sm btn-light py-0 px-2" style="font-size: 0.75rem;" @click="expandedLogId = null">
                      ✕ Tutup
                    </button>
                  </div>

                  <div class="row g-2">
                    <div class="col-md-6">
                      <label class="form-label fw-bold mb-1" style="font-size: 0.75rem;">Request Payload (JSON Dikirim ke Kemenkes):</label>
                      <pre class="bg-dark text-light p-2 rounded" style="max-height: 250px; overflow: auto; font-size: 0.75rem; border-radius: 6px;">{{ JSON.stringify(log.request_payload, null, 2) }}</pre>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-bold mb-1" style="font-size: 0.75rem;">Response Payload (Respon Kemenkes SATUSEHAT):</label>
                      <pre class="bg-dark text-light p-2 rounded" style="max-height: 250px; overflow: auto; font-size: 0.75rem; border-radius: 6px;">{{ JSON.stringify(log.response_payload, null, 2) }}</pre>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../services/api';

export default {
  name: 'SatusehatMonitoringView',
  data() {
    return {
      loading: true,
      status: {},
      logs: [],
      expandedLogId: null
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [statusRes, logsRes] = await Promise.all([
          api.getSatusehatStatus(),
          api.getSatusehatLogs()
        ]);
        this.status = statusRes.data || {};
        this.logs = logsRes.data || [];
      } catch (err) {
        console.error('Gagal memuat log SATUSEHAT:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDateTime(dt) {
      if (!dt) return '-';
      const d = new Date(dt);
      return d.toLocaleDateString('id-ID') + ' ' + d.toLocaleTimeString('id-ID');
    },
    toggleExpand(id) {
      if (this.expandedLogId === id) {
        this.expandedLogId = null;
      } else {
        this.expandedLogId = id;
      }
    }
  }
};
</script>
