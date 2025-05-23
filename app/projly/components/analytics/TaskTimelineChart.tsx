
import {
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TaskTimelineChartProps {
  data: Array<{
    name: string;
    total: number;
    completed: number;
  }>;
}

export function TaskTimelineChart({ data }: TaskTimelineChartProps) {
  console.log("Rendering TaskTimelineChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(value: any, name: any) => {
          // Ensure value is a valid number to prevent NaN errors
          console.log(`[TaskTimelineChart] Tooltip formatting: value=${value}, name=${name}`);
          
          if (value === undefined || value === null || isNaN(Number(value))) {
            return ['0', String(name || '')];
          }
          
          return [Number(value).toFixed(0), String(name || '')];
        }} />
        <Legend />
        <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Tasks" />
        <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed Tasks" />
      </LineChart>
    </ResponsiveContainer>
  );
}
