import { toast } from 'react-hot-toast';

// Base styles for all notifications
const baseStyle = {
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.12)',
  fontSize: '14px',
  maxWidth: '380px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  transform: 'translateY(0)',
  transition: 'all 0.2s ease',
  lineHeight: '1.5'
};

// Modern icon styles
const iconStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  flexShrink: 0,
  fontSize: '14px'
};

// Notification types configuration with modern colors
export const NOTIFICATION_TYPES = {
  success: {
    style: {
      ...baseStyle,
      background: 'rgba(16, 185, 129, 0.95)',
      color: '#ffffff',
      borderLeft: '4px solid #059669'
    },
    iconStyle: {
      ...iconStyle,
      background: 'rgba(255, 255, 255, 0.2)'
    },
    duration: 2000,
    position: 'bottom-right'
  },
  error: {
    style: {
      ...baseStyle,
      background: 'rgba(239, 68, 68, 0.95)',
      color: '#ffffff',
      borderLeft: '4px solid #DC2626'
    },
    iconStyle: {
      ...iconStyle,
      background: 'rgba(255, 255, 255, 0.2)'
    },
    duration: 3000,
    position: 'bottom-right'
  },
  info: {
    style: {
      ...baseStyle,
      background: 'rgba(59, 130, 246, 0.95)',
      color: '#ffffff',
      borderLeft: '4px solid #2563EB'
    },
    iconStyle: {
      ...iconStyle,
      background: 'rgba(255, 255, 255, 0.2)'
    },
    duration: 2000,
    position: 'bottom-right'
  },
  warning: {
    style: {
      ...baseStyle,
      background: 'rgba(245, 158, 11, 0.95)',
      color: '#ffffff',
      borderLeft: '4px solid #D97706'
    },
    iconStyle: {
      ...iconStyle,
      background: 'rgba(255, 255, 255, 0.2)'
    },
    duration: 2500,
    position: 'bottom-right'
  }
};

// Modern icons for different notification types
const ICONS = {
  success: '✓',
  error: '×',
  info: 'i',
  warning: '!'
};

// Notification manager to handle multiple notifications
let activeToasts = new Set();
const MAX_TOASTS = 3;
let recentMessages = new Map();

const dismissOldestToast = () => {
  if (activeToasts.size >= MAX_TOASTS) {
    const oldestToast = Array.from(activeToasts)[0];
    toast.dismiss(oldestToast);
    activeToasts.delete(oldestToast);
  }
};

const isDuplicateMessage = (message, type) => {
  const key = `${type}-${message}`;
  const now = Date.now();
  const recentMessage = recentMessages.get(key);
  
  for (const [msgKey, timestamp] of recentMessages.entries()) {
    if (now - timestamp > 2000) {
      recentMessages.delete(msgKey);
    }
  }
  
  if (recentMessage && now - recentMessage < 2000) {
    return true;
  }
  
  recentMessages.set(key, now);
  return false;
};

// Main notification function with modern styling
export const notify = (message, type = 'info', options = {}) => {
  if (isDuplicateMessage(message, type)) {
    return null;
  }

  dismissOldestToast();

  const config = NOTIFICATION_TYPES[type];
  const toastId = toast(
    (t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        <div style={config.iconStyle}>
          <span role="img" aria-label={type} style={{ color: '#ffffff' }}>
            {ICONS[type]}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500 }}>{message}</div>
        </div>
      </div>
    ),
    {
      ...config,
      ...options,
      id: `toast-${Date.now()}`,
      className: 'modern-toast',
      onClose: () => {
        activeToasts.delete(toastId);
        if (options.onClose) options.onClose();
      }
    }
  );

  activeToasts.add(toastId);
  return toastId;
};

// Convenience methods
export const notifySuccess = (message, options = {}) => notify(message, 'success', options);
export const notifyError = (message, options = {}) => notify(message, 'error', options);
export const notifyInfo = (message, options = {}) => notify(message, 'info', options);
export const notifyWarning = (message, options = {}) => notify(message, 'warning', options);

// Helper to dismiss all notifications
export const dismissAllNotifications = () => {
  toast.dismiss();
  activeToasts.clear();
  recentMessages.clear();
}; 