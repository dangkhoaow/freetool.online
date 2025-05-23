
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface TaskDueDateChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

export function TaskDueDateChart({ data }: TaskDueDateChartProps) {
  console.log("Rendering TaskDueDateChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[200px] items-center justify-center">No data available</div>;
  }

  // Define colors for different due date periods
  const COLORS = {
    'overdue': '#ef4444', // red
    'today': '#f97316', // orange
    'thisWeek': '#f59e0b', // amber
    'thisMonth': '#3b82f6', // blue
    'future': '#10b981', // green
    'default': '#6b7280' // gray
  };

  // Get color for a period
  const getColorForPeriod = (name: string) => {
    const key = name.toLowerCase().replace(/\s+/g, '');
    return COLORS[key as keyof typeof COLORS] || COLORS.default;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => {
            if (name && percent !== undefined) {
              return `${name}: ${(percent * 100).toFixed(0)}%`;
            }
            return '';
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColorForPeriod(entry.name)} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [`${String(value || 0)} tasks`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
