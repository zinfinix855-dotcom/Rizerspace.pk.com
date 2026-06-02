import { toast as hotToast } from 'react-hot-toast'

export const toastOptions = {
  style: {
    background: '#111111',
    color: '#FFFFFF',
    border: '1px solid rgba(220, 38, 38, 0.35)',
    boxShadow: '0 18px 40px rgba(0,0,0,0.6), 0 0 20px rgba(220,38,38,0.14)',
    borderRadius: '16px',
    fontSize: '13px',
    fontFamily: 'Outfit, sans-serif'
  },
  success: {
    iconTheme: {
      primary: '#DC2626',
      secondary: '#FFFFFF'
    }
  },
  error: {
    iconTheme: {
      primary: '#FF3B3B',
      secondary: '#111111'
    }
  },
  loading: {
    iconTheme: {
      primary: '#FFFFFF',
      secondary: '#DC2626'
    }
  }
}

const toast = {
  success: (message, options = {}) => hotToast.success(message, { ...toastOptions, ...options }),
  error: (message, options = {}) => hotToast.error(message, { ...toastOptions, ...options }),
  loading: (message, options = {}) => hotToast.loading(message, { ...toastOptions, ...options }),
  custom: (message, options = {}) => hotToast(message, { ...toastOptions, ...options })
}

export default toast
