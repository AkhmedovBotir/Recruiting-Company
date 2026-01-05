import { motion } from 'framer-motion';

const Loading = ({ text = 'Yuklanmoqda...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <motion.div
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="mt-4 text-gray-600">{text}</p>
    </div>
  );
};

export default Loading;

