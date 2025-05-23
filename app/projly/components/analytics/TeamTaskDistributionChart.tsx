
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
    value: number;
  }>;
}

export function TeamTaskDistributionChart({ data }: TeamTaskDistributionChartProps) {
  console.log("Rendering TeamTaskDistributionChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center">No data available</div>;
  }

  // Sort data by task count (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

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
            return value && typeof value === 'string' && value.length > 13 ? value.substring(0, 10) + '...' : value;
          }}
        />
        <Tooltip formatter={(value: any, name: any) => {
          // Add comprehensive error handling to prevent NaN issues
          console.log(`[TeamTaskDistributionChart] Tooltip formatting: value=${value}, name=${name}`);
          
          // Ensure value is a valid number
          const formattedValue = value === undefined || value === null || isNaN(Number(value)) ? 0 : Number(value);
          
          return [`${formattedValue} tasks`, 'Assigned Tasks'];
        }} />
        <Legend />
        <Bar dataKey="value" fill="#3b82f6" name="Assigned Tasks" />
      </BarChart>
    </ResponsiveContainer>
  );
}
