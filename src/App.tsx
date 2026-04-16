import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, BarChart3, Settings, ChevronLeft, User, Flame, Home } from "lucide-react";
import { MealType, DailyRecord, AnalysisResult } from "./types";
import { analyzeFoodImage } from "./services/gemini";
import CalorieBar from "./components/CalorieBar";
import FoodList from "./components/FoodList";
import FeedbackMessage from "./components/FeedbackMessage";
import ImageUpload from "./components/ImageUpload";
import StatusChart from "./components/StatusChart";
import { cn } from "./lib/utils";

type View = "home" | "input" | "feedback" | "status" | "settings";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [customCalories, setCustomCalories] = useState<number | "">(2500);
  const [useCustomCalories, setUseCustomCalories] = useState(false);
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>([]);
  const [mealType, setMealType] = useState<MealType>("아침");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<DailyRecord | null>(null);

  const recommendedCalories = useCustomCalories && typeof customCalories === "number" 
    ? customCalories 
    : (gender === "male" ? 2500 : 2000);
  
  const totalDailyCalories = useMemo(() => {
    return dailyRecords.reduce((sum, record) => sum + record.totalCalories, 0);
  }, [dailyRecords]);

  const handleAnalysis = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const result: AnalysisResult = await analyzeFoodImage(
        base64Image,
        "image/jpeg",
        recommendedCalories,
        totalDailyCalories
      );

      const newRecord: DailyRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        mealType,
        foods: result.foods,
        totalCalories: result.total_calories,
        feedback: result.feedback,
        imageUrl: base64Image,
      };

      setDailyRecords((prev) => [...prev, newRecord]);
      setLastAnalysis(newRecord);
      setView("feedback");
    } catch (error) {
      alert(error instanceof Error ? error.message : "분석 중 오류가 발생했어.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderHome = () => (
    <div className="space-y-8 pb-32">
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-accent-pink rounded-[24px] flex items-center justify-center text-3xl shadow-sm">
            🥗
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-accent-orange leading-none">kcalog</h1>
            <p className="text-xs font-bold text-text-muted mt-1">똑똑한 칼로리 관리의 시작</p>
          </div>
        </div>
        <button onClick={() => setView("settings")} className="p-3 bg-white rounded-[24px] shadow-sm border border-[#FDF2E4]">
          <Settings size={24} className="text-text-muted" />
        </button>
      </header>

      <section className="card-round">
        <CalorieBar current={totalDailyCalories} max={recommendedCalories} />
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-extrabold">오늘의 식단</h2>
          <span className="text-sm font-bold text-text-muted">{dailyRecords.length}개 기록됨</span>
        </div>
        
        {dailyRecords.length === 0 ? (
          <div className="card-round bg-accent-pink/20 border-none flex flex-col items-center justify-center py-16 text-center space-y-4">
            <p className="text-5xl">🥪</p>
            <p className="font-extrabold text-text-main text-lg">아직 먹은 게 없어?<br/>빨리 뭐라도 찍어서 올려봐.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dailyRecords.map((record) => (
              <button 
                key={record.id} 
                onClick={() => {
                  setLastAnalysis(record);
                  setView("feedback");
                }}
                className="w-full card-round p-5 flex gap-5 items-center hover:bg-accent-pink/5 transition-colors text-left"
              >
                {record.imageUrl && (
                  <img src={record.imageUrl} className="w-20 h-20 rounded-[20px] object-cover border-2 border-[#FDF2E4]" alt="Food" />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black px-3 py-1 bg-bg-natural rounded-full text-text-muted uppercase tracking-tighter">{record.mealType}</span>
                    <span className="text-xs font-bold text-text-muted">
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-extrabold text-lg mt-2 text-text-main">{record.foods.map(f => f.name).join(", ")}</p>
                  <p className="text-base font-black text-danger-red">{record.totalCalories} kcal</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );

  const renderInput = () => (
    <div className="space-y-8 pb-12">
      <header className="flex items-center gap-4">
        <button onClick={() => setView("home")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">식단 등록</h1>
      </header>

      <div className="space-y-4">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">식사 타입 선택</p>
        <div className="grid grid-cols-4 gap-2">
          {(["아침", "점심", "저녁", "간식"] as MealType[]).map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={cn(
                "py-3 rounded-2xl font-bold transition-all",
                mealType === type 
                  ? "bg-slate-900 text-white shadow-lg" 
                  : "bg-white text-slate-500 border border-slate-100"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">음식 사진</p>
        <ImageUpload onUpload={handleAnalysis} isAnalyzing={isAnalyzing} />
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="space-y-8 pb-12">
      <header className="flex items-center gap-4">
        <button onClick={() => setView("home")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">분석 결과</h1>
      </header>

      <section className="card-round">
        <CalorieBar current={totalDailyCalories} max={recommendedCalories} />
      </section>

      {lastAnalysis && (
        <>
          {lastAnalysis.imageUrl && (
            <div className="w-full aspect-square rounded-[32px] overflow-hidden border-4 border-white shadow-lg">
              <img src={lastAnalysis.imageUrl} alt="Analyzed Food" className="w-full h-full object-cover" />
            </div>
          )}
          <FeedbackMessage message={lastAnalysis.feedback} />
          <section className="card-round">
            <FoodList foods={lastAnalysis.foods} totalCalories={lastAnalysis.totalCalories} />
          </section>
        </>
      )}

      <button onClick={() => setView("home")} className="w-full btn-primary h-14">
        확인 완료
      </button>
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <h1 className="text-xl font-bold">칼로리 리포트</h1>
      </header>

      <section className="card-round space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg">주간 활동</h2>
          <span className="text-xs font-bold text-text-muted px-3 py-1 bg-bg-natural rounded-full">최근 7일</span>
        </div>
        <StatusChart recommended={recommendedCalories} />
      </section>

      <section className="card-round bg-feedback-bg border-dashed border-feedback-border space-y-3">
        <div className="flex items-center gap-2">
          <div className="bg-accent-orange text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">AI 총평</div>
          <h3 className="font-extrabold text-feedback-text">주간 리포트 한줄평</h3>
        </div>
        <p className="text-feedback-text font-bold leading-relaxed">
          "이번 주 데이터 보니까 거의 뭐 먹방 유튜버 데뷔 준비 중인 듯? 
          주말에 폭주한 거 다 티 나니까 다음 주부턴 좀 인간답게 먹자 ㅋㅋ"
        </p>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="card-round p-5 space-y-1">
          <p className="text-xs font-bold text-slate-400">주간 평균</p>
          <p className="text-xl font-black">2,150 <span className="text-xs font-normal">kcal</span></p>
        </div>
        <div className="card-round p-5 space-y-1">
          <p className="text-xs font-bold text-slate-400">최고 기록</p>
          <p className="text-xl font-black text-brand-red">3,200 <span className="text-xs font-normal">kcal</span></p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-8 pb-12">
      <header className="flex items-center gap-4">
        <button onClick={() => setView("home")} className="p-2 bg-white rounded-full shadow-sm border border-slate-100">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold">설정</h1>
      </header>

      <section className="card-round space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-accent-pink/30 rounded-[20px]">
            <User className="text-accent-orange" />
          </div>
          <div>
            <p className="font-bold">사용자 프로필</p>
            <p className="text-xs text-slate-400">권장 칼로리 설정을 위한 정보</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-slate-500">성별 선택</p>
            <button 
              onClick={() => setUseCustomCalories(!useCustomCalories)}
              className={cn("text-xs font-bold px-3 py-1 rounded-full transition-colors", useCustomCalories ? "bg-accent-orange text-white" : "bg-slate-100 text-slate-400")}
            >
              직접 입력 {useCustomCalories ? "ON" : "OFF"}
            </button>
          </div>
          
          {!useCustomCalories ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGender("male")}
                className={cn(
                  "py-4 rounded-[20px] font-bold border-2 transition-all",
                  gender === "male" 
                    ? "bg-accent-pink/20 border-accent-orange text-accent-orange" 
                    : "bg-white border-slate-100 text-slate-400"
                )}
              >
                남성 (2500kcal)
              </button>
              <button
                onClick={() => setGender("female")}
                className={cn(
                  "py-4 rounded-[20px] font-bold border-2 transition-all",
                  gender === "female" 
                    ? "bg-accent-pink/20 border-accent-orange text-accent-orange" 
                    : "bg-white border-slate-100 text-slate-400"
                )}
              >
                여성 (2000kcal)
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="number"
                value={customCalories}
                onChange={(e) => setCustomCalories(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="목표 칼로리 입력"
                className="w-full p-4 bg-white border-2 border-accent-pink rounded-[20px] font-bold text-lg focus:outline-none focus:border-accent-orange transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-text-muted">kcal</span>
            </div>
          )}
        </div>
      </section>

      <div className="card-round bg-slate-900 text-white p-6 space-y-2">
        <p className="text-sm font-bold opacity-60">현재 설정된 권장 칼로리</p>
        <p className="text-3xl font-black">{recommendedCalories} kcal</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 px-6 pt-8 relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {view === "home" && renderHome()}
          {view === "input" && renderInput()}
          {view === "feedback" && renderFeedback()}
          {view === "status" && renderStatus()}
          {view === "settings" && renderSettings()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[calc(448px-3rem)] h-20 bg-white/90 backdrop-blur-xl rounded-[2.5rem] border border-[#FDF2E4] shadow-2xl flex items-center justify-around px-4 z-50">
        <button 
          onClick={() => setView("home")}
          className={cn("p-4 transition-all rounded-[20px]", view === "home" ? "text-accent-orange bg-accent-pink/20" : "text-text-muted")}
        >
          <Home size={24} />
        </button>
        
        <button 
          onClick={() => setView("input")}
          className="w-14 h-14 bg-accent-orange text-white rounded-2xl flex items-center justify-center shadow-lg shadow-accent-orange/20 active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>

        <button 
          onClick={() => setView("status")}
          className={cn("p-4 transition-all rounded-2xl", view === "status" ? "text-accent-orange bg-accent-pink/20" : "text-text-muted")}
        >
          <BarChart3 size={24} />
        </button>
      </nav>
    </div>
  );
}
