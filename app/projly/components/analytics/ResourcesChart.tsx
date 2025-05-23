
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ResourcesChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
}

const COLORS = ["#3b82f6", "#f97316", "#10b981", "#64748b", "#8b5cf6", "#ef4444", "#d946ef"];

export function ResourcesChart({ data }: ResourcesChartProps) {
  console.log("Rendering ResourcesChart with data:", data);
  
  if (!data || data.length === 0) {
    return <div className="flex h-[300px] items-center justify-center">No data available</div>;
  }

  // Sort data by value (descending)
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sortedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => {
            // Check for undefined, null, or NaN values to prevent rendering errors
            if (!name || percent === undefined || percent === null || isNaN(percent)) {
              console.log(`[ResourcesChart] Invalid label values: name=${name}, percent=${percent}`);
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
          formatter={(value: number, name: string) => {
            // Ensure value is a valid number
            const formattedValue = value === undefined || value === null || isNaN(value) ? 0 : value;
            return [`${formattedValue} resources`, String(name || 'Unknown')];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
