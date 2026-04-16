import { useState, useRef, ChangeEvent } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ImageUploadProps {
  onUpload: (base64: string) => void;
  isAnalyzing: boolean;
}

export default function ImageUpload({ onUpload, isAnalyzing }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onUpload(preview);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload-buttons"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-4 p-12 bg-accent-pink/30 rounded-3xl border-2 border-dashed border-accent-pink hover:border-accent-orange transition-colors group"
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="text-accent-orange" size={32} />
              </div>
              <div className="text-center">
                <p className="font-extrabold text-xl text-text-main">음식 사진 올리기</p>
                <p className="text-sm font-bold text-text-muted mt-1">갤러리에서 이미지를 선택해줘</p>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square w-full rounded-3xl overflow-hidden border-4 border-white shadow-xl"
          >
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={handleClear}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {preview && (
        <button
          onClick={handleConfirm}
          disabled={isAnalyzing}
          className="w-full btn-primary flex items-center justify-center gap-2 h-14"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin" />
              <span>AI가 분석 중...</span>
            </>
          ) : (
            <span>이거 먹었어! 분석해줘</span>
          )}
        </button>
      )}
    </div>
  );
}
