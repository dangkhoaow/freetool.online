
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
    name: string;
    value: number;
  }>;
}

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#64748b", "#8b5cf6"];

export function TaskStatusChart({ data }: TaskStatusChartProps) {
  console.log("Rendering TaskStatusChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[200px] items-center justify-center">No data available</div>;
  }

  // Sort data by value (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

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
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => {
            // Check for undefined, null, or NaN values to prevent rendering errors
            if (!name || percent === undefined || percent === null || isNaN(percent)) {
              console.log(`[TaskStatusChart] Invalid label values: name=${name}, percent=${percent}`);
              return '';
            }
            return `${String(name)}: ${(percent * 100).toFixed(0)}%`;
          }}
        >
          {sortedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any, name: any) => {
            // Ensure value is a valid number
            const formattedValue = value === undefined || value === null || isNaN(Number(value)) ? 0 : Number(value);
            console.log(`[TaskStatusChart] Tooltip formatting: value=${value}, name=${name}`);
            return [`${formattedValue} tasks`, String(name || '')]; 
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
