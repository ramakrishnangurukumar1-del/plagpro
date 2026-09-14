import { PieChart, Pie, Cell } from 'recharts';

export default function Donut({ value, color, size = 160, label }) {
  const data = [
    { name: 'value', value },
    { name: 'rest', value: 100 - value },
  ];
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={size / 2 - 18}
          outerRadius={size / 2 - 4}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          <Cell fill={color} />
          <Cell fill="var(--border)" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{value}%</span>
        {label && <span className="text-xs text-[var(--text-dim)] mt-1 text-center px-4">{label}</span>}
      </div>
    </div>
  );
}
