import { FoodItem } from "../types";
import { Utensils } from "lucide-react";

interface FoodListProps {
  foods: FoodItem[];
  totalCalories: number;
}

export default function FoodList({ foods, totalCalories }: FoodListProps) {
  return (
    <div className="space-y-6">
      <div className="text-xl font-extrabold flex justify-between items-center">
        오늘 먹은 것들
        <span className="text-xs font-bold px-3 py-1 bg-[#EEE] rounded-full text-text-muted">기록 완료</span>
      </div>
      
      <div className="space-y-3">
        {foods.map((food, index) => (
          <div key={index} className="flex justify-between items-center p-4 bg-[#FDFDFD] rounded-[20px] border border-[#EEE]">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🍽️</span>
              <span className="font-bold text-lg text-text-main">{food.name}</span>
            </div>
            <span className="font-bold text-lg text-danger-red">{food.calories} kcal</span>
          </div>
        ))}
      </div>

      <div className="pt-6 border-t border-[#F0F0F0] flex justify-between items-center">
        <span className="text-xl font-bold">합계</span>
        <span className="text-3xl font-black text-danger-red">{totalCalories.toLocaleString()} kcal</span>
      </div>
      
      <p className="text-xs text-text-muted mt-8 text-center leading-relaxed">
        ※ 이 칼로리는 AI가 이미지를 기반으로 추정한 값이라 정확하지 않을 수 있음. 그냥 재미로 참고해라.
      </p>
    </div>
  );
}
