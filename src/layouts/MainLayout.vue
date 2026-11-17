<template>
  <!-- Jika di halaman login, tampilkan slot saja tanpa layout sidebar -->
  <div v-if="$route.path === '/login'">
    <slot />
  </div>

  <div v-else class="layout-sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <!-- Backdrop untuk tampilan mobile saat sidebar dibuka -->
    <div
      v-if="isMobileMenuOpen"
      class="sidebar-backdrop d-lg-none"
      @click="isMobileMenuOpen = false"
    ></div>

    <!-- SIDEBAR UTAMA (Tabler Vertical Navbar) -->
    <aside class="navbar-vertical d-print-none" :class="{ show: isMobileMenuOpen }">
      <!-- Brand Header Sidebar -->
      <div class="navbar-brand d-flex align-items-center justify-content-between p-3 border-bottom mb-2">
        <router-link to="/" class="d-flex align-items-center gap-2 text-decoration-none" title="SIM-Klinik Rawat Jalan">
          <span style="font-size: 1.6rem;">🏥</span>
          <div>
            <div class="text-primary fw-bold" style="font-size: 1.15rem; line-height: 1.2;">SIM-Klinik</div>
            <span class="badge bg-blue-lt" style="font-size: 0.68rem; padding: 2px 6px;">Rawat Jalan</span>
          </div>
        </router-link>
        <!-- Tombol Garis 3 di dalam Sidebar -->
        <button
          type="button"
          class="btn btn-sm btn-icon btn-light text-muted border-0 shadow-none sidebar-toggle-btn"
          @click="toggleSidebar"
          title="Sembunyikan Sidebar (Mode Layar Penuh)"
          aria-label="Tutup Sidebar"
          style="width: 32px; height: 32px; border-radius: 6px; font-size: 1.15rem; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;"
        >
          ☰
        </button>
      </div>

      <!-- Navigasi Menu Vertikal -->
      <div class="navbar-nav">
        <div class="nav-header">Menu Utama</div>
        <router-link to="/" class="nav-link" active-class="active" exact @click="handleNavClick">
          <span class="nav-link-icon">📊</span>
          <span>Dashboard</span>
        </router-link>

        <div class="nav-header">Alur Rawat Jalan</div>
        <router-link to="/pendaftaran" class="nav-link" active-class="active" @click="handleNavClick">
          <span class="nav-link-icon">🚶</span>
          <span>1. Pasien Datang</span>
        </router-link>

        <router-link to="/dokter" class="nav-link" active-class="active" @click="handleNavClick">
          <span class="nav-link-icon">🩺</span>
          <span>2. Diperiksa Dokter</span>
        </router-link>

        <router-link to="/farmasi" class="nav-link" active-class="active" @click="handleNavClick">
          <span class="nav-link-icon">💊</span>
          <span>3. Ambil Obat & Pulang</span>
        </router-link>

        <div class="nav-header">Integrasi Nasional</div>
        <router-link to="/satusehat" class="nav-link" active-class="active" @click="handleNavClick">
          <span class="nav-link-icon">🇮🇩</span>
          <span>Monitoring SATUSEHAT</span>
        </router-link>
      </div>

      <!-- User Card di Bagian Bawah Sidebar -->
      <div v-if="currentUser" class="sidebar-user border-top">
        <div class="d-flex align-items-center gap-2">
          <span class="avatar bg-blue-lt fw-bold rounded-circle" style="width: 36px; height: 36px; font-size: 0.95rem; flex-shrink: 0;">
            {{ (currentUser.full_name || 'U').charAt(0) }}
          </span>
          <div class="overflow-hidden" style="min-width: 0; flex: 1;">
            <div class="fw-bold text-truncate" style="font-size: 0.85rem; color: #1e293b;" :title="currentUser.full_name">
              {{ currentUser.full_name }}
            </div>
            <span class="badge bg-green-lt text-uppercase" style="font-size: 0.62rem;">
              ● {{ currentUser.role }}
            </span>
          </div>
          <button
            class="btn btn-sm btn-light text-danger p-1"
            @click="handleLogout"
            title="Keluar dari sistem"
            style="border: none; background: transparent; font-size: 1.1rem;"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>

    <!-- AREA KONTEN UTAMA -->
    <div class="layout-main-wrapper">
      <!-- Topbar Header -->
      <header class="topbar-header d-print-none">
        <div class="d-flex align-items-center gap-3">
          <!-- Tombol Garis 3 di Navbar HANYA muncul saat Sidebar sedang di-hide pada Desktop -->
          <div v-if="isSidebarCollapsed && !isMobile" class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-icon sidebar-toggle-btn shadow-sm"
              @click="toggleSidebar"
              title="Tampilkan Menu Sidebar"
              aria-label="Tampilkan Sidebar"
              style="width: 38px; height: 38px; border-radius: 8px; font-size: 1.25rem; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;"
            >
              ☰
            </button>
            <router-link
              to="/"
              class="d-flex align-items-center gap-2 text-decoration-none"
              title="SIM-Klinik Rawat Jalan"
            >
              <span style="font-size: 1.35rem;">🏥</span>
              <span class="text-primary fw-bold" style="font-size: 1.1rem; line-height: 1;">SIM-Klinik</span>
              <span class="badge bg-blue-lt" style="font-size: 0.65rem; padding: 2px 6px;">Rawat Jalan</span>
            </router-link>
          </div>

          <!-- Tombol Garis 3 Khusus Mobile (< 992px) -->
          <button
            v-if="isMobile"
            type="button"
            class="btn btn-icon sidebar-toggle-btn shadow-sm"
            @click="toggleSidebar"
            title="Buka Menu"
            aria-label="Buka Menu"
            style="width: 38px; height: 38px; border-radius: 8px; font-size: 1.25rem; display: inline-flex; align-items: center; justify-content: center; cursor: pointer;"
          >
            ☰
          </button>

          <!-- Status Indikator SATUSEHAT -->
          <div class="d-flex align-items-center gap-2">
            <span class="badge bg-green-lt badge-pill" style="font-size: 0.75rem;">
              ● SATUSEHAT Staging Sandbox Active
            </span>
          </div>
        </div>

        <!-- Profil Dropdown di Kanan Topbar -->
        <div v-if="currentUser" class="dropdown position-relative">
          <div
            class="d-flex align-items-center gap-2 p-1 px-2 rounded user-profile-trigger"
            @click.stop="isDropdownOpen = !isDropdownOpen"
            style="cursor: pointer;"
            title="Menu Akun"
          >
            <span class="avatar bg-blue-lt fw-bold rounded-circle" style="width: 34px; height: 34px; font-size: 0.9rem;">
              {{ (currentUser.full_name || 'U').charAt(0) }}
            </span>
            <div class="text-start d-none d-sm-block" style="line-height: 1.2;">
              <div class="fw-bold" style="font-size: 0.85rem; color: #1e293b;">
                {{ currentUser.full_name }}
              </div>
              <span class="text-muted" style="font-size: 0.7rem;">
                @{{ currentUser.username }}
              </span>
            </div>
          </div>

          <!-- Dropdown Menu -->
          <div
            v-if="isDropdownOpen"
            class="dropdown-menu show shadow-lg border mt-2 p-3"
            style="min-width: 270px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.12) !important; right: 0;"
          >
            <div class="d-flex align-items-center gap-3 pb-3 border-bottom mb-2">
              <span class="avatar bg-blue-lt fw-bold rounded-circle" style="width: 44px; height: 44px; font-size: 1.1rem; flex-shrink: 0;">
                {{ (currentUser.full_name || 'U').charAt(0) }}
              </span>
              <div style="min-width: 0; flex: 1;">
                <div class="fw-bold text-truncate" style="font-size: 0.95rem; color: #1e293b;" :title="currentUser.full_name">
                  {{ currentUser.full_name }}
                </div>
                <div class="text-muted" style="font-size: 0.8rem;">
                  @{{ currentUser.username }}
                </div>
                <span class="badge bg-green-lt text-uppercase mt-1" style="font-size: 0.68rem; font-weight: 700;">
                  ● {{ currentUser.role }}
                </span>
              </div>
            </div>

            <div class="py-1">
              <router-link
                to="/satusehat"
                class="dropdown-item rounded py-2 d-flex align-items-center gap-2"
                style="font-size: 0.85rem;"
                @click="isDropdownOpen = false"
              >
                <span style="font-size: 1.1rem;">🇮🇩</span>
                <span class="fw-bold">Status SATUSEHAT</span>
              </router-link>
            </div>

            <div class="dropdown-divider my-2"></div>

            <button
              type="button"
              class="dropdown-item text-danger rounded py-2 d-flex align-items-center gap-2 fw-bold"
              style="font-size: 0.85rem;"
              @click="handleLogout"
            >
              <span style="font-size: 1.1rem;">🚪</span>
              <span>Keluar dari Sistem</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Halaman Body Konten -->
      <main class="page-wrapper" style="flex: 1;">
        <div class="page-body">
          <slot />
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer border-top py-3 text-center text-muted d-print-none" style="background: #fff; font-size: 0.8rem;">
        <div class="container-xl">
          Sistem Informasi Manajemen Klinik Rawat Jalan &bull; Standar HL7 FHIR SATUSEHAT Kemenkes RI &bull; Template Tabler (Bootstrap 5)
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { api } from '../services/api';
import { showAlert } from '../utils/alert';

export default {
  name: 'MainLayout',
  data() {
    return {
      currentUser: api.getCurrentUser(),
      isDropdownOpen: false,
      isMobileMenuOpen: false,
      isSidebarCollapsed: localStorage.getItem('simrs_sidebar_collapsed') === '1',
      windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200
    };
  },
  computed: {
    isMobile() {
      return this.windowWidth < 992;
    }
  },
  watch: {
    $route() {
      this.currentUser = api.getCurrentUser();
      this.isDropdownOpen = false;
      this.isMobileMenuOpen = false;
    }
  },
  mounted() {
    document.addEventListener('click', this.closeDropdownOutside);
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeDropdownOutside);
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
    },
    toggleSidebar() {
      if (window.innerWidth >= 992) {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
        localStorage.setItem('simrs_sidebar_collapsed', this.isSidebarCollapsed ? '1' : '0');
      } else {
        this.isMobileMenuOpen = !this.isMobileMenuOpen;
      }
    },
    handleNavClick() {
      if (window.innerWidth < 992) {
        this.isMobileMenuOpen = false;
      }
    },
    closeDropdownOutside(e) {
      if (!this.$el.querySelector?.('.dropdown')?.contains(e.target)) {
        this.isDropdownOpen = false;
      }
    },
    async handleLogout() {
      this.isDropdownOpen = false;
      const confirmed = await showAlert.confirm(
        'Konfirmasi Keluar',
        'Apakah Anda yakin ingin keluar dari sistem SIM-Klinik?',
        'Ya, Keluar',
        'Batal'
      );
      if (confirmed) {
        api.logout();
        this.$router.push('/login');
      }
    }
  }
};
</script>
