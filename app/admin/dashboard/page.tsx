"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useRouter } from "next/navigation";
import { Activity, Clock, Cpu, HardDrive } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// System metrics interface
interface SystemMetrics {
  cpu: number;
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  nvmeDisk?: {
    total: number;
    used: number;
    free: number;
    percentage: number;
    mountPoint?: string;
    device?: string;
  };
  nvmeMounts?: {
    mountPoint: string;
    type?: string;
    size?: string;
    isBound?: boolean;
    percentage: number;
  }[];
  swap?: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  uptime: number;
}

// Format bytes to human-readable format
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format uptime to human-readable format
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [chartData, setChartData] = useState({
    labels: Array(30).fill("").map((_, i) => `${i + 1}s ago`).reverse(),
    datasets: [
      {
        label: "CPU Usage (%)",
        data: Array(30).fill(0),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Memory Usage (%)",
        data: Array(30).fill(0),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "Root Disk (%)",
        data: Array(30).fill(0),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "NVMe Disk (%)",
        data: Array(30).fill(0),
        borderColor: "rgb(255, 159, 64)",
        backgroundColor: "rgba(255, 159, 64, 0.5)",
        hidden: true, // Hidden by default, will be shown when NVMe is available
      },
      {
        label: "Swap Usage (%)",
        data: Array(30).fill(0),
        borderColor: "rgb(153, 102, 255)",
        backgroundColor: "rgba(153, 102, 255, 0.5)",
        hidden: true, // Hidden by default, will be shown when swap is available
      },
    ],
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          router.push("/admin/login");
          return;
        }

        const response = await fetch("/api/admin/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          router.push("/admin/login");
          return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();

      // Set up interval for live updates
      const interval = setInterval(() => {
        fetchMetrics();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Update chart when metrics change
  useEffect(() => {
    if (metrics) {
      setChartData((prevData) => {
        const cpuData = [...prevData.datasets[0].data.slice(1), metrics.cpu];
        const memoryData = [...prevData.datasets[1].data.slice(1), metrics.memory.percentage];
        const diskData = [...prevData.datasets[2].data.slice(1), metrics.disk.percentage];
        const nvmeData = metrics.nvmeDisk ? [...prevData.datasets[3].data.slice(1), metrics.nvmeDisk.percentage] : [...prevData.datasets[3].data.slice(1), 0];
        const swapData = metrics.swap ? [...prevData.datasets[4].data.slice(1), metrics.swap.percentage] : [...prevData.datasets[4].data.slice(1), 0];

        // Update visibility of NVMe and swap datasets based on availability
        const newDatasets = [...prevData.datasets];
        newDatasets[3].hidden = !metrics.nvmeDisk;
        newDatasets[4].hidden = !metrics.swap;

        return {
          ...prevData,
          datasets: [
            { ...newDatasets[0], data: cpuData },
            { ...newDatasets[1], data: memoryData },
            { ...newDatasets[2], data: diskData },
            { ...newDatasets[3], data: nvmeData },
            { ...newDatasets[4], data: swapData },
          ],
        };
      });
    }
  }, [metrics]);

  // Fetch system metrics
  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/admin/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error("Failed to fetch metrics");
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mt-12">
      <h1 className="text-2xl font-bold mb-6">System Dashboard</h1>
      
      {/* System overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Cpu className="w-6 h-6 mr-2 text-blue-500" />
              <div className="text-2xl font-bold">{metrics?.cpu.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="w-6 h-6 mr-2 text-red-500" />
              <div className="text-2xl font-bold">{metrics?.memory.percentage.toFixed(1)}%</div>
              <span className="ml-2 text-sm text-gray-500">
                ({formatBytes(metrics ? metrics.memory.used : 0)} / {formatBytes(metrics ? metrics.memory.total : 0)})
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <HardDrive className="w-6 h-6 mr-2 text-green-500" />
              <div className="text-2xl font-bold">{metrics?.disk.percentage.toFixed(1)}%</div>
              <span className="ml-2 text-sm text-gray-500">
                ({formatBytes(metrics ? metrics.disk.used : 0)} / {formatBytes(metrics ? metrics.disk.total : 0)})
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="w-6 h-6 mr-2 text-purple-500" />
              <div className="text-2xl font-bold">{formatUptime(metrics?.uptime || 0)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>System Resource Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Line 
              data={chartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Usage %'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Time'
                    }
                  }
                }
              }} 
            />
          </div>
        </CardContent>
      </Card>
      
      {/* NVMe section (conditionally rendered) */}
      {metrics?.nvmeDisk && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>NVMe Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Device: {metrics.nvmeDisk.device || 'Unknown Device'}</p>
                <p className="text-sm text-gray-500">Mount Point: {metrics.nvmeDisk.mountPoint || '/mnt/nvme_data'}</p>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <HardDrive className="w-5 h-5 mr-2 text-orange-500" />
                  <div className="text-xl font-bold">{metrics.nvmeDisk.percentage.toFixed(1)}%</div>
                  <span className="ml-2 text-sm text-gray-500">
                    ({formatBytes(metrics.nvmeDisk.used)} / {formatBytes(metrics.nvmeDisk.total)})
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-orange-500 h-2.5 rounded-full" 
                    style={{ width: `${metrics.nvmeDisk.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* NVMe Mount Points */}
            {metrics.nvmeMounts && metrics.nvmeMounts.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Mount Points ({metrics.nvmeMounts.length})</h3>
                <div className="grid grid-cols-1 gap-3">
                  {metrics.nvmeMounts.map((mount, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium truncate max-w-[400px]" title={mount.mountPoint}>
                            {mount.mountPoint}
                          </span>
                          <span className="text-xs text-gray-500">
                            {mount.type || (mount.isBound ? 'Bind Mount' : 'Direct Mount')}
                            {mount.size && ` (${mount.size})`}
                          </span>
                        </div>
                        {mount.percentage > 0 && (
                          <span className="text-xs text-gray-500">
                            {mount.percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {mount.percentage > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-orange-300 h-1.5 rounded-full" 
                            style={{ 
                              width: `${mount.percentage}%`,
                              backgroundColor: mount.percentage > 90 
                                ? '#ef4444' 
                                : mount.percentage > 70 
                                  ? '#f59e0b' 
                                  : '#22c55e'
                            }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Swap section (conditionally rendered) */}
      {metrics?.swap && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Swap Memory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2">
              <Activity className="w-5 h-5 mr-2 text-purple-500" />
              <div className="text-xl font-bold">{metrics.swap.percentage.toFixed(1)}%</div>
              <span className="ml-2 text-sm text-gray-500">
                ({formatBytes(metrics.swap.used)} / {formatBytes(metrics.swap.total)})
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-purple-500 h-2.5 rounded-full" 
                style={{ width: `${metrics.swap.percentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
