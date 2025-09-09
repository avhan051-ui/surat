import Swal from 'sweetalert2';

// Custom Toast Configuration
export const showToast = (options: {
  title: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  timer?: number;
}) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: options.timer || 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon: options.icon || 'info',
    title: options.title
  });
};

// Success Toast
export const showSuccessToast = (title: string, timer?: number) => {
  return showToast({
    title,
    icon: 'success',
    timer
  });
};

// Error Toast
export const showErrorToast = (title: string, timer?: number) => {
  return showToast({
    title,
    icon: 'error',
    timer
  });
};

// Warning Toast
export const showWarningToast = (title: string, timer?: number) => {
  return showToast({
    title,
    icon: 'warning',
    timer
  });
};

// Info Toast
export const showInfoToast = (title: string, timer?: number) => {
  return showToast({
    title,
    icon: 'info',
    timer
  });
};

// Confirmation Dialog
export const showConfirmationDialog = (options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}) => {
  return Swal.fire({
    title: options.title,
    text: options.text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: options.confirmButtonText || 'Ya',
    cancelButtonText: options.cancelButtonText || 'Batal'
  });
};