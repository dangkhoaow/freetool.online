
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TaskStatusChartProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#64748b", "#8b5cf6"];

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  console.log("Rendering TaskStatusChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[200px] items-center justify-center">No data available</div>;
  }

  // Sort data by count (descending)
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          nameKey="status"
          label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [`${value} tasks`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
