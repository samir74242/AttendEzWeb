import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastState {
  type: 'success' | 'error';
  message: string;
  id: string;
}

interface DownloadContextType {
  isDownloading: boolean;
  triggerDownload: () => Promise<void>;
  toasts: ToastState[];
  removeToast: (id: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function useDownload() {
  const context = useContext(DownloadContext);
  if (!context) {
    throw new Error('useDownload must be used within a DownloadProvider');
  }
  return context;
}

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { type, message, id }]);
  };

  const triggerDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Programmatic hidden anchor click for seamless download on current page
      // This bypasses CORS completely by utilizing the native browser navigation/download behavior
      const link = document.createElement('a');
      link.href = '/api/download';
      link.setAttribute('download', 'AttendEz.apk');
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Trigger success toast
      showToast('success', '✅ Download started successfully.');
    } catch (error) {
      console.error('Programmatic download failed:', error);
      showToast('error', '❌ Download failed. Please try again.');
    } finally {
      // Keep loading animation for about 1 second
      setTimeout(() => {
        setIsDownloading(false);
      }, 1000);
    }
  };

  return (
    <DownloadContext.Provider value={{ isDownloading, triggerDownload, toasts, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} triggerDownload={triggerDownload} />
    </DownloadContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
  triggerDownload
}: {
  toasts: ToastState[];
  removeToast: (id: string) => void;
  triggerDownload: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 md:left-auto md:right-6 -translate-x-1/2 md:translate-x-0 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-[90%] sm:w-auto">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
            onRetry={triggerDownload}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onClose,
  onRetry
}: {
  key?: string;
  toast: ToastState;
  onClose: () => void;
  onRetry: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl shadow-xl border backdrop-blur-md ${
        toast.type === 'success'
          ? 'bg-[#10b981]/95 dark:bg-emerald-950/90 border-emerald-500/30 text-white shadow-emerald-950/20'
          : 'bg-[#ef4444]/95 dark:bg-red-950/90 border-red-500/30 text-white shadow-red-950/20'
      }`}
    >
      <span className="text-sm font-semibold tracking-wide flex-1 leading-snug">
        {toast.message}
      </span>
      {toast.type === 'error' && (
        <button
          onClick={() => {
            onClose();
            onRetry();
          }}
          className="px-2.5 py-1 text-xs font-bold bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white rounded-lg border border-white/30 mr-1"
        >
          Retry
        </button>
      )}
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white p-1 rounded-lg transition-colors"
        aria-label="Close notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
}
