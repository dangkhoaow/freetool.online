
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

interface TeamTaskDistributionChartProps {
  data: Array<{
    name: string;
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }>;
}

export function TeamTaskDistributionChart({ data }: TeamTaskDistributionChartProps) {
  console.log("Rendering TeamTaskDistributionChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center">No data available</div>;
  }

  // Sort data by total tasks (descending)
  const sortedData = [...data].sort((a, b) => b.total - a.total);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" />
        <YAxis
          dataKey="name"
          type="category"
          scale="band"
          width={100}
          tickFormatter={(value) => {
            // Truncate long names
            return value.length > 13 ? value.substring(0, 10) + '...' : value;
          }}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
        <Bar dataKey="inProgress" stackId="a" fill="#f97316" name="In Progress" />
        <Bar dataKey="pending" stackId="a" fill="#3b82f6" name="Pending" />
      </BarChart>
    </ResponsiveContainer>
  );
}
