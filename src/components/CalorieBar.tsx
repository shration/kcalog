import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface CalorieBarProps {
  current: number;
  max: number;
}

export default function CalorieBar({ current, max }: CalorieBarProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isOver = current > max;
  const overAmount = current - max;

  let barColor = "bg-primary-green";
  if (percentage >= 70 && percentage < 100) barColor = "bg-warning-yellow";
  if (isOver) barColor = "bg-danger-red";

  return (
    <div className="w-full space-y-6">
      <div className="text-lg font-bold">🔥 오늘 나의 칼로리 상태</div>
      
      <div className="flex justify-between items-baseline">
        <div className="text-6xl font-black text-text-main">
          {Math.round((current / max) * 100)}%
        </div>
        <div className="text-xl font-bold text-text-muted">
          오늘 {current.toLocaleString()} / {max.toLocaleString()} kcal
        </div>
      </div>

      <div className="h-10 w-full bg-[#F0F0F0] rounded-[20px] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-[20px]", barColor)}
        />
      </div>

      <div className="flex justify-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-green"></div>
          <span className="text-xs font-bold text-text-muted">안전</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-yellow"></div>
          <span className="text-xs font-bold text-text-muted">주의</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger-red"></div>
          <span className="text-xs font-bold text-text-muted">위험</span>
        </div>
      </div>

      {isOver && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-bold text-danger-red text-right"
        >
          +{overAmount.toLocaleString()} kcal 초과 ㄷㄷ
        </motion.p>
      )}
    </div>
  );
}
