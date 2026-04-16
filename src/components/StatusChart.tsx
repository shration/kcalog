import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { day: '월', kcal: 1850 },
  { day: '화', kcal: 2100 },
  { day: '수', kcal: 2800 },
  { day: '목', kcal: 1950 },
  { day: '금', kcal: 2300 },
  { day: '토', kcal: 3200 },
  { day: '일', kcal: 1500 },
];

export default function StatusChart({ recommended }: { recommended: number }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#cbd5e1' }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="kcal" radius={[10, 10, 0, 0]}>
            {data.map((entry, index) => {
              let color = '#A8E6CF'; // primary-green
              if (entry.kcal > recommended) color = '#FF6B6B'; // danger-red
              else if (entry.kcal > recommended * 0.8) color = '#FFD93D'; // warning-yellow
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={color}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-6 pt-4 border-t border-[#FDF2E4] mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary-green"></div>
          <span className="text-[10px] font-bold text-text-muted">안전</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning-yellow"></div>
          <span className="text-[10px] font-bold text-text-muted">주의</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger-red"></div>
          <span className="text-[10px] font-bold text-text-muted">위험</span>
        </div>
      </div>
    </div>
  );
}
