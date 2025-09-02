import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef } from "react";

interface AnalyticsData {
  completed: number;
  pending: number;
  total: number;
  completionRate: number;
}

export function TaskAnalytics() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  useEffect(() => {
    if (analytics && chartRef.current) {
      import('chart.js/auto').then((Chart) => {
        const ctx = chartRef.current!.getContext('2d');
        
        // Destroy existing chart
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        // Create new chart
        chartInstanceRef.current = new Chart.default(ctx!, {
          type: 'pie',
          data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
              data: [analytics.completed, analytics.pending],
              backgroundColor: ['hsl(142, 76%, 36%)', 'hsl(43, 96%, 56%)'],
              borderWidth: 0,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      });
    }

    // Cleanup
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [analytics]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-slate-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart Container */}
        {analytics.total > 0 ? (
          <div className="mb-4 h-48">
            <canvas ref={chartRef} className="w-full h-full"></canvas>
          </div>
        ) : (
          <div className="mb-4 h-48 flex items-center justify-center text-slate-500">
            No tasks to display
          </div>
        )}

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-sm text-slate-600">Completed</span>
            </div>
            <span className="text-sm font-medium text-slate-800">
              {analytics.completed}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-sm text-slate-600">Pending</span>
            </div>
            <span className="text-sm font-medium text-slate-800">
              {analytics.pending}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">
                Completion Rate
              </span>
              <span className="text-sm font-bold text-success">
                {analytics.completionRate}%
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
