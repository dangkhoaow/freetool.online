
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ProjectStatusChartProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  "Planning": "#3b82f6",
  "In Progress": "#f97316",
  "Completed": "#10b981",
  "On Hold": "#64748b",
  "Cancelled": "#ef4444",
};

const DEFAULT_COLORS = ["#3b82f6", "#f97316", "#10b981", "#64748b", "#ef4444"];

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  console.log("Rendering ProjectStatusChart with data:", data);
  
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
            <Cell 
              key={`cell-${index}`} 
              fill={STATUS_COLORS[entry.status] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [`${value} projects`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
