import Swal from 'sweetalert2';

/**
 * Helper alert modern menggunakan SweetAlert2
 * Terintegrasi dengan styling Bootstrap 5 & Tabler
 */

export const showAlert = {
  success: (title, text = '') => {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonColor: '#206bc4',
      confirmButtonText: 'Selesai'
    });
  },

  error: (title, text = '') => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonColor: '#d63939',
      confirmButtonText: 'Tutup'
    });
  },

  warning: (title, text = '') => {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonColor: '#f59f00',
      confirmButtonText: 'Mengerti'
    });
  },

  info: (title, text = '') => {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: text,
      confirmButtonColor: '#206bc4',
      confirmButtonText: 'OK'
    });
  },

  confirm: async (title, text = '', confirmText = 'Ya, Lanjutkan!', cancelText = 'Batal') => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#206bc4',
      cancelButtonColor: '#626976',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    });
    return result.isConfirmed;
  }
};
