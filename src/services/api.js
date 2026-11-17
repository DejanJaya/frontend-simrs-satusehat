/**
 * API Service untuk SIM Klinik Rawat Jalan
 * Menggunakan browser native Fetch API (Zero extra dependencies)
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('simrs_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Terjadi kesalahan pada server (HTTP ${response.status})`);
  }

  return data;
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getCurrentUser: () => {
    try {
      const u = localStorage.getItem('simrs_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  },
  setCurrentUser: (user, token) => {
    localStorage.setItem('simrs_user', JSON.stringify(user));
    localStorage.setItem('simrs_token', token);
  },
  logout: () => {
    localStorage.removeItem('simrs_user');
    localStorage.removeItem('simrs_token');
  },

  // Dashboard
  getDashboard: () => request('/visits/dashboard'),

  // Pasien
  getPatients: (search = '') => request(`/patients?search=${encodeURIComponent(search)}`),
  getPatientById: (id) => request(`/patients/${id}`),
  createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
  checkSatusehatNik: (nik) => request(`/patients/check-satusehat/${nik}`),
  syncPatientSatusehat: (id) => request(`/patients/${id}/sync-satusehat`, { method: 'POST' }),

  // Dokter & Lokasi
  getDoctors: () => request('/doctors'),
  getLocations: () => request('/doctors/locations'),

  // Kunjungan & Antrean
  getTodayVisits: (status = '', doctorId = '') => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (doctorId) params.append('doctor_id', doctorId);
    return request(`/visits/today?${params.toString()}`);
  },
  getVisitById: (id) => request(`/visits/${id}`),
  createVisit: (data) => request('/visits', { method: 'POST', body: JSON.stringify(data) }),
  updateVisitStatus: (id, status) => request(`/visits/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Pemeriksaan Dokter & Rekam Medis
  getMedicalRecord: (visitId) => request(`/medical-records/visit/${visitId}`),
  saveMedicalRecord: (data) => request('/medical-records', { method: 'POST', body: JSON.stringify(data) }),

  // Farmasi & Kasir
  getMedicines: (search = '') => request(`/pharmacy/medicines?search=${encodeURIComponent(search)}`),
  createMedicine: (data) => request('/pharmacy/medicines', { method: 'POST', body: JSON.stringify(data) }),
  getPendingPrescriptions: () => request('/pharmacy/prescriptions/pending'),
  dispenseAndComplete: (visitId, paymentMethod = 'TUNAI') =>
    request('/pharmacy/dispense', {
      method: 'POST',
      body: JSON.stringify({ visit_id: visitId, payment_method: paymentMethod })
    }),

  // SATUSEHAT Monitoring
  getSatusehatStatus: () => request('/satusehat/status'),
  getSatusehatLogs: (status = '') => request(`/satusehat/logs?status=${status}`)
};
