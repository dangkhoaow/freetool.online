
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ResourcesChartProps {
  data: Array<{
    type: string;
    total: number;
  }>;
}

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#64748b", "#8b5cf6", "#ef4444", "#d946ef"];

export function ResourcesChart({ data }: ResourcesChartProps) {
  console.log("Rendering ResourcesChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center">No data available</div>;
  }

  // Sort data by total (descending)
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="total"
          nameKey="type"
          label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [`${value} units`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
