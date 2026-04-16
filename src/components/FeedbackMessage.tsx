import { motion } from "motion/react";

interface FeedbackMessageProps {
  message: string;
}

export default function FeedbackMessage({ message }: FeedbackMessageProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative mt-4"
    >
      <div className="bg-feedback-bg p-6 rounded-[24px] border-2 border-dashed border-feedback-border">
        <p className="text-xl font-bold text-feedback-text leading-snug">
          {message}
        </p>
      </div>
      <div className="absolute -top-3 left-5 bg-accent-orange text-white px-2.5 py-0.5 rounded-lg text-xs font-bold">
        AI
      </div>
    </motion.div>
  );
}
