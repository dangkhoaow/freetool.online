'use client';

import { DashboardLayout } from '@/app/projly/components/layout/DashboardLayout';
import { MyTaskHealthWidget } from './components/MyTaskHealthWidget';
import { TeamActivityFeed } from './components/TeamActivityFeed';
import { MemberActivityTable } from './components/MemberActivityTable';
import { MemberActivityCalendar } from './components/MemberActivityCalendar';
import { TaskTimelineDashboard } from './components/TaskTimelineDashboard';
import { AnalyticsChartsSection } from './components/AnalyticsChartsSection';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your team's activity and progress.
            </p>
          </div>

          {/* Top Row - Personal Task Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <MyTaskHealthWidget />
            </div>
            <div className="lg:col-span-2">
              <TeamActivityFeed />
            </div>
          </div>

          {/* Team Member Activity Table */}
          <MemberActivityTable />

          {/* Team Member Activity Calendar */}
          <MemberActivityCalendar />

          {/* Parent Tasks Timeline */}
          <TaskTimelineDashboard />

          {/* Bottom Row - Analytics Charts */}
          {/* <AnalyticsChartsSection /> */}
        </div>
      </div>
    </DashboardLayout>
  );
}
