import { motion, AnimatePresence } from 'framer-motion';

const Alert = ({ message, type = 'error', onClose }) => {
  const bgColors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`border rounded-lg p-4 ${bgColors[type]} mb-4`}
        >
          <div className="flex items-center justify-between">
            <p>{message}</p>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 text-current opacity-70 hover:opacity-100"
              >
                ×
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;

