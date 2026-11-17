<template>
  <div class="page page-center d-flex align-items-center justify-content-center" style="min-height: 100vh; background: #f4f6fa;">
    <div class="container container-tight py-4" style="max-width: 440px;">
      <div class="text-center mb-4">
        <span style="font-size: 3rem;">🏥</span>
        <h2 class="text-primary fw-bold mt-2 mb-1">SIM-Klinik Rawat Jalan</h2>
        <div class="text-muted" style="font-size: 0.85rem;">Terintegrasi SATUSEHAT Kemenkes RI (HL7 FHIR)</div>
      </div>

      <div class="card card-md shadow-sm border">
        <div class="card-body p-4">
          <h3 class="card-title text-center mb-4">Masuk ke Sistem Klinik</h3>

          <div v-if="errorMessage" class="alert alert-danger py-2 mb-3" style="font-size: 0.85rem;">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label">Username</label>
              <input
                type="text"
                v-model="username"
                class="form-control"
                placeholder="Masukkan username Anda"
                required
                autofocus
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input
                type="password"
                v-model="password"
                class="form-control"
                placeholder="Masukkan password"
                required
              />
            </div>

            <div class="form-footer mt-4">
              <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" :disabled="loading">
                {{ loading ? 'Memproses...' : 'Masuk ke Sistem ➔' }}
              </button>
            </div>
          </form>

          <hr class="my-4" />

          <!-- Tombol Akun Cepat untuk Demo / Portofolio -->
          <div class="text-center">
            <div class="text-muted mb-2" style="font-size: 0.75rem; text-transform: uppercase; font-weight: bold;">
              Akses Cepat (Akun Demo Portofolio)
            </div>
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <button class="btn btn-sm btn-light" @click="quickLogin('admin', 'admin123')">
                🛡️ Admin
              </button>
              <button class="btn btn-sm btn-light" @click="quickLogin('resepsionis', 'pendaftaran123')">
                🚶 Resepsionis
              </button>
              <button class="btn btn-sm btn-light" @click="quickLogin('dokter', 'dokter123')">
                🩺 Dokter
              </button>
              <button class="btn btn-sm btn-light" @click="quickLogin('farmasi', 'farmasi123')">
                💊 Farmasi
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center text-muted mt-3" style="font-size: 0.8rem;">
        Standar HL7 FHIR R4 &bull; Permenkes No. 24 Tahun 2022
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../services/api';

export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    quickLogin(user, pass) {
      this.username = user;
      this.password = pass;
      this.handleLogin();
    },
    async handleLogin() {
      if (!this.username || !this.password) return;
      this.loading = true;
      this.errorMessage = '';
      try {
        const res = await api.login(this.username, this.password);
        if (res.success && res.data) {
          api.setCurrentUser(res.data.user, res.data.token);
          this.$router.push('/');
        }
      } catch (err) {
        this.errorMessage = err.message || 'Username atau password tidak cocok.';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
