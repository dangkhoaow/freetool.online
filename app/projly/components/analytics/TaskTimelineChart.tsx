
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TaskTimelineChartProps {
  data: Array<{
    month: string;
    pending: number;
    completed: number;
    inProgress: number;
  }>;
}

export function TaskTimelineChart({ data }: TaskTimelineChartProps) {
  console.log("Rendering TaskTimelineChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
        <Bar dataKey="inProgress" stackId="a" fill="#f97316" name="In Progress" />
        <Bar dataKey="pending" stackId="a" fill="#3b82f6" name="Pending" />
      </BarChart>
    </ResponsiveContainer>
  );
}
