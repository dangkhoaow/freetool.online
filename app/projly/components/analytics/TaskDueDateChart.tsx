
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
    color: string;
  }>;
}

export function TaskDueDateChart({ data }: TaskDueDateChartProps) {
  console.log("Rendering TaskDueDateChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[200px] items-center justify-center">No data available</div>;
  }

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
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
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
