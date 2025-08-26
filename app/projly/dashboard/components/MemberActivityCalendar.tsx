'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
  getDay
} from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Users, Clock, AlertCircle, Filter } from "lucide-react";
import { useMemberActivityCalendarAnalytics, useMemberActivityHeatmap, useMemberActivityStreaks, useMemberFlowEfficiency } from "@/lib/services/projly/use-analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useProfile } from "@/lib/services/projly/use-profile";
import { ActivityDetailDialog } from '@/app/projly/components/ActivityDetailDialog';

interface MemberActivity {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  activityCount: number;
  activities: Activity[];
}

interface Activity {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changedFields: any;
  createdAt: string;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DayActivity {
  date: string;
  members: MemberActivity[];
}

export function MemberActivityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedMember, setSelectedMember] = useState<MemberActivity | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');

  const { data: profile } = useProfile();
  const { data: calendarData, isLoading, error } = useMemberActivityCalendarAnalytics(
    currentMonth.getMonth() + 1, 
    currentMonth.getFullYear()
  );

  // Helper function to get member name
  const getMemberName = (member: { firstName?: string; lastName?: string; email: string }) => {
    return `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
  };

  // Filter activities by selected member
  const filteredActivitiesByDate = useMemo(() => {
    if (!calendarData?.activities || selectedMemberFilter === 'all') {
      return calendarData?.activities || [];
    }
    
    return calendarData.activities.map((dayActivity: DayActivity) => ({
      ...dayActivity,
      members: dayActivity.members.filter((member: MemberActivity) => 
        member.userId === selectedMemberFilter
      )
    })).filter((dayActivity: DayActivity) => dayActivity.members.length > 0);
  }, [calendarData?.activities, selectedMemberFilter]);

  // Get available members for filter
  const availableMembers = useMemo(() => {
    if (!calendarData?.members) return [];
    
    return calendarData.members.map((member: any) => ({
      userId: member.userId,
      name: getMemberName(member)
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [calendarData?.members]);

  // Reset filter when month changes
  useEffect(() => {
    setSelectedMemberFilter('all');
  }, [currentMonth]);

  // Calculate days to display in the calendar
  const startDate = startOfWeek(startOfMonth(currentMonth));
  const endDate = endOfWeek(endOfMonth(currentMonth));
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  // Create a map for quick lookup of activities by date (using filtered data)
  const activitiesByDate = new Map<string, MemberActivity[]>();
  if (filteredActivitiesByDate) {
    filteredActivitiesByDate.forEach((dayActivity: DayActivity) => {
      activitiesByDate.set(dayActivity.date, dayActivity.members);
    });
  }

  // Navigate to previous month
  const previousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  // Navigate to next month
  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Get members for a specific day
  const getMembersForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return activitiesByDate.get(dateKey) || [];
  };

  // Handle member click
  const handleMemberClick = (member: MemberActivity, date: string) => {
    setSelectedMember(member);
    setSelectedDate(date);
    setShowMemberDialog(true);
  };

  // Handle activity click
  const handleActivityClick = (activityId: string) => {
    setSelectedActivity(activityId);
    setShowActivityDialog(true);
    setShowMemberDialog(false);
  };

  // Determine cell styles based on the day
  const getDayClass = (day: Date) => {
    const members = getMembersForDay(day);
    return cn(
      "h-24 border p-1 text-sm transition-colors hover:bg-muted/50 relative cursor-pointer",
      {
        "bg-muted/20": !isSameMonth(day, currentMonth),
        "bg-accent/5": isToday(day),
        "bg-green-50 dark:bg-green-900/10": members.length > 0 && isSameMonth(day, currentMonth),
      }
    );
  };

  // Get member initials
  const getMemberInitials = (member: MemberActivity) => {
    const name = getMemberName(member);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get activity type color
  const getActivityTypeColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-100 text-green-800 border-green-300';
      case 'updated': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'status_changed': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'commented': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Member Activity Calendar
          </CardTitle>
          <CardDescription>Track daily team member activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !calendarData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Member Activity Calendar
          </CardTitle>
          <CardDescription>Track daily team member activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-700 dark:text-red-300">Unable to load activity calendar data</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Member Activity Calendar
              </CardTitle>
              <CardDescription>
                Track daily team member activities • {calendarData.members.length} team members
              </CardDescription>
            </div>
            
            {/* Member Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedMemberFilter} onValueChange={setSelectedMemberFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members</SelectItem>
                  {availableMembers.map((member) => (
                    <SelectItem key={member.userId} value={member.userId}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={goToToday}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div 
                  key={day} 
                  className="h-10 flex items-center justify-center text-sm font-medium"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
              {daysInMonth.map((day, idx) => {
                const dayMembers = getMembersForDay(day);
                
                return (
                  <div
                    key={idx}
                    className={getDayClass(day)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs",
                            isToday(day) && "bg-primary text-primary-foreground font-medium",
                            !isSameMonth(day, currentMonth) && "text-muted-foreground"
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        
                        {/* Member count indicator */}
                        {dayMembers.length > 0 && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs h-4 px-1 bg-blue-100 text-blue-800"
                            title="Total of activity members"
                          >
                            {dayMembers.length}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Day indicator for different month */}
                      {!isSameMonth(day, currentMonth) && (
                        <span className="text-xs text-muted-foreground">
                          {format(day, 'MMM')}
                        </span>
                      )}
                    </div>
                    
                    {/* Members for this day */}
                    <div className="max-h-16 overflow-y-auto space-y-1">
                      {dayMembers
                        .sort((a, b) => b.activityCount - a.activityCount) // Sort by activity count desc
                        .map((member, memberIdx) => (
                        <div
                          key={`${member.userId}-${memberIdx}`}
                          className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-sm border hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={() => handleMemberClick(member, format(day, 'yyyy-MM-dd'))}
                        >
                          <Avatar className="h-4 w-4">
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-800">
                              {getMemberInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs truncate flex-1">
                            {getMemberName(member)}
                          </span>
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            {member.activityCount}
                          </Badge>
                        </div>
                      ))}
                      
                      {/* Show counter if there are more members than can fit */}
                      {dayMembers.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayMembers.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Insights Tabs */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Activity Insights
          </CardTitle>
          <CardDescription>Heatmap, streaks and flow efficiency</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="heatmap">
            <TabsList className="mb-4">
              <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              <TabsTrigger value="streaks">Streaks</TabsTrigger>
              <TabsTrigger value="flow">Flow</TabsTrigger>
            </TabsList>

            <TabsContent value="heatmap">
              <HeatmapView month={currentMonth.getMonth() + 1} year={currentMonth.getFullYear()} />
            </TabsContent>
            <TabsContent value="streaks">
              <StreaksView />
            </TabsContent>
            <TabsContent value="flow">
              <FlowEfficiencyView month={currentMonth.getMonth() + 1} year={currentMonth.getFullYear()} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Member Activities Dialog */}
      <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activities for {selectedMember && getMemberName(selectedMember)}
            </DialogTitle>
            <DialogDescription>
              {selectedDate && `Activities on ${format(new Date(selectedDate), 'MMMM dd, yyyy')}`}
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4">
              {/* Member Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    {getMemberInitials(selectedMember)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{getMemberName(selectedMember)}</p>
                  <p className="text-sm text-muted-foreground">{selectedMember.email}</p>
                  <Badge variant="outline" className="mt-1">
                    {selectedMember.activityCount} activities
                  </Badge>
                </div>
              </div>

              {/* Activities List */}
              <div className="space-y-3">
                <h3 className="font-semibold">Activities</h3>
                {selectedMember.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => handleActivityClick(activity.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant="outline" 
                        className={getActivityTypeColor(activity.action)}
                      >
                        {activity.action.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(activity.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">
                      {activity.entityType === 'task' && 'Task activity'}
                      {activity.entityType === 'comment' && 'Comment activity'}
                      {activity.entityType === 'project' && 'Project activity'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click to view details
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Detail Dialog */}
      <ActivityDetailDialog
        activityId={selectedActivity}
        open={showActivityDialog}
        onOpenChange={(open) => {
          setShowActivityDialog(open);
          if (!open) {
            setSelectedActivity(null);
            // Reopen the member dialog when activity detail closes
            if (selectedMember) {
              setShowMemberDialog(true);
            }
          }
        }}
      />
    </>
  );
}

// ---- Insights subcomponents ----

function HeatmapView({ month, year }: { month: number; year: number }) {
  const { data, isLoading } = useMemberActivityHeatmap(month, year);
  if (isLoading) return <div className="text-sm text-muted-foreground">Loading heatmap...</div>;
  if (!data) return null;
  const members = data.members || [];
  const heatmap = data.heatmap || {} as Record<string, number[][]>;
  const getName = (m: any) => `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {members.map((m: any) => (
        <div key={m.userId} className="p-3 border rounded-md bg-white dark:bg-gray-900 space-y-2">
          <div className="text-sm font-medium truncate">{getName(m)}</div>
          <div className="w-full space-y-1">
            {Array.from({ length: 7 }).map((_, d) => (
              <div key={d} className="flex w-full gap-1">
                {Array.from({ length: 24 }).map((__, h) => {
                  const v = heatmap[m.userId]?.[d]?.[h] || 0;
                  const intensity = v === 0 ? 'bg-gray-100 dark:bg-gray-800' : v < 3 ? 'bg-blue-200' : v < 6 ? 'bg-blue-400' : 'bg-blue-600';
                  return <div key={h} className={`flex-1 aspect-square ${intensity} rounded-sm`} title={`Day ${d} Hour ${h}: ${v} activities`}/>;
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StreaksView() {
  const { data, isLoading } = useMemberActivityStreaks(60);
  if (isLoading) return <div className="text-sm text-muted-foreground">Loading streaks...</div>;
  if (!data) return null;
  const getName = (m: any) => `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
      {data.map((m: any) => (
        <div key={m.userId} className="p-3 border rounded-md bg-white dark:bg-gray-900">
          <div className="font-medium text-sm">{getName(m)}</div>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="px-2 py-1 rounded bg-green-100 text-green-800">Current: {m.currentStreak}d</span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">Longest: {m.longestStreak}d</span>
            <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">Active: {m.activeDaysInWindow}d</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FlowEfficiencyView({ month, year }: { month: number; year: number }) {
  const { data, isLoading } = useMemberFlowEfficiency(month, year);
  if (isLoading) return <div className="text-sm text-muted-foreground">Loading flow efficiency...</div>;
  if (!data) return null;
  const getName = (m: any) => `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email;
  const rows = data.sort((a: any, b: any) => a.medianGapHours - b.medianGapHours);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
        <div className="col-span-6 ml-2 text-sm">Member</div>
        <div className="col-span-3 text-right text-sm">Touches</div>
        <div className="col-span-3 text-right text-sm">Median gap (h)</div>
      </div>
      {rows.map((m: any) => (
        <div key={m.memberId} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-md bg-white dark:bg-gray-900">
          <div className="col-span-6 text-sm font-medium">{getName(m)}</div>
          <div className="col-span-3 text-right text-xs text-muted-foreground">{m.touches}</div>
          <div className="col-span-3 text-right text-xs">
            <span className="inline-block px-2 py-1 rounded bg-purple-100 text-purple-800">{m.medianGapHours}h</span>
          </div>
        </div>
      ))}
    </div>
  );
}
