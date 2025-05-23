
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
    name: string;
    value: number;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  "Planning": "#3b82f6",
  "In Progress": "#f97316",
  "Completed": "#10b981",
  "On Hold": "#64748b",
  "Cancelled": "#ef4444",
  "Archived": "#64748b",
  "default": "#9ca3af"
};

const DEFAULT_COLORS = ["#3b82f6", "#f97316", "#10b981", "#64748b", "#ef4444"];

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  console.log("Rendering ProjectStatusChart with data:", data);
  
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
            // Add explicit checks for name and percent to prevent NaN errors
            if (!name || percent === undefined || percent === null || isNaN(percent)) {
              console.log(`[ProjectStatusChart] Invalid label values: name=${name}, percent=${percent}`);
              return '';
            }
            return `${String(name)}: ${(percent * 100).toFixed(0)}%`;
          }}
        >
          {sortedData.map((entry, index) => {
            const statusName = entry.name || 'default';
            const color = STATUS_COLORS[statusName] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
            return <Cell key={`cell-${index}`} fill={color} />;
          })}
        </Pie>
        <Tooltip 
          formatter={(value: any, name: any) => {
            // Add comprehensive error handling to prevent NaN issues
            console.log(`[ProjectStatusChart] Tooltip formatting: value=${value}, name=${name}`);
            
            // Ensure value is a valid number
            const formattedValue = value === undefined || value === null || isNaN(Number(value)) ? 0 : Number(value);
            
            // Ensure name is a valid string
            const formattedName = name === undefined || name === null ? 'Unknown' : String(name);
            
            return [`${formattedValue} projects`, formattedName];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
