import { createRouter, createWebHistory } from 'vue-router';

import LoginView from '../views/LoginView.vue';
import DashboardView from '../views/DashboardView.vue';
import RegistrationView from '../views/RegistrationView.vue';
import DoctorQueueView from '../views/DoctorQueueView.vue';
import DoctorExaminationView from '../views/DoctorExaminationView.vue';
import PharmacyView from '../views/PharmacyView.vue';
import SatusehatMonitoringView from '../views/SatusehatMonitoringView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/pendaftaran',
    name: 'Pendaftaran',
    component: RegistrationView
  },
  {
    path: '/dokter',
    name: 'DokterAntrean',
    component: DoctorQueueView
  },
  {
    path: '/dokter/periksa/:id',
    name: 'DokterPemeriksaan',
    component: DoctorExaminationView
  },
  {
    path: '/farmasi',
    name: 'FarmasiKasir',
    component: PharmacyView
  },
  {
    path: '/satusehat',
    name: 'SatusehatMonitoring',
    component: SatusehatMonitoringView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('simrs_token');
  if (!to.meta.public && !token) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;
