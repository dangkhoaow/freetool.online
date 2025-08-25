'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Award,
  BarChart3,
  HeartHandshake,
  Shield
} from "lucide-react";
import { 
  useTeamOwnershipMetrics,
  useSprintCommitmentAnalytics,
  useDailyStandupPrepAnalytics,
  useBlockerResolutionAnalytics
} from "@/lib/services/projly/use-analytics";
import { format } from "date-fns";

interface TeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export function TeamOwnershipDashboard() {
  const { data: ownershipData, isLoading: loadingOwnership } = useTeamOwnershipMetrics();
  const { data: sprintData, isLoading: loadingSprint } = useSprintCommitmentAnalytics();
  const { data: standupData, isLoading: loadingStandup } = useDailyStandupPrepAnalytics();
  const { data: blockerData, isLoading: loadingBlocker } = useBlockerResolutionAnalytics();

  const getMemberName = (member: TeamMember) => {
    return `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
  };

  const getMemberInitials = (member: TeamMember) => {
    const name = getMemberName(member);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOwnershipScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPreparednessBadge = (preparedness: string) => {
    return preparedness === 'prepared' 
      ? <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Prepared</Badge>
      : <Badge variant="outline" className="text-red-600 border-red-300 text-xs"><Clock className="h-3 w-3 mr-1" />Unprepared</Badge>;
  };

  if (loadingOwnership || loadingSprint || loadingStandup || loadingBlocker) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Team Ownership & Motivation</h2>
        <p className="text-muted-foreground">
          Boost team accountability, recognize achievements, and identify improvement opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Sprint Commitment & Delivery Scorecard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Sprint Commitment & Delivery Scorecard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sprintData?.slice(0, 8).map((member: any) => (
                <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getMemberInitials(member)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{getMemberName(member)}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.delivered}/{member.sprintCommitment} tasks delivered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.successRate}%</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(member.trend)}
                        <span className={`text-xs ${member.onTrack ? 'text-green-600' : 'text-red-600'}`}>
                          {member.onTrack ? 'On Track' : 'At Risk'}
                        </span>
                      </div>
                    </div>
                    <Progress value={member.successRate} className="w-16" />
                  </div>
                </div>
              ))}
              {(!sprintData || sprintData.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No sprint data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Task Ownership Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Task Ownership Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ownershipData?.slice(0, 8).map((member: any) => (
                <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getMemberInitials(member)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{getMemberName(member)}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>{member.selfAssignedTasks}/{member.totalTasks} self-assigned</span>
                        <span>•</span>
                        <span>{member.updatedToday} updated today</span>
                        {member.blockedItems > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-600">{member.blockedItems} blocked</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${getOwnershipScoreColor(member.ownershipScore)} hover:bg-primary hover:text-white`}>
                      {member.ownershipScore >= 90 && <Star className="h-3 w-3 mr-1" />}
                      {member.ownershipScore}%
                    </Badge>
                    {member.ownershipScore < 50 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  </div>
                </div>
              ))}
              {(!ownershipData || ownershipData.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No ownership data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Daily Stand-up Preparation Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Daily Stand-up Preparation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {standupData?.slice(0, 8).map((member: any) => (
                <div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getMemberInitials(member)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{getMemberName(member)}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.tasksUpdated24h} tasks updated in 24h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPreparednessBadge(member.preparedness)}
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          member.preparedness === 'prepared' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: member.preparedness === 'prepared' ? '100%' : '20%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {(!standupData || standupData.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No standup prep data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4. Blocker Resolution Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Blocker Resolution Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {blockerData?.slice(0, 8).map((resolver: any, index: number) => (
                <div key={resolver.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{getMemberInitials(resolver)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{getMemberName(resolver)}</p>
                      <p className="text-xs text-muted-foreground">
                        {resolver.blockersResolved} blockers • {resolver.avgResolutionTime}d avg
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {resolver.teamHelperScore}
                  </Badge>
                </div>
              ))}
              {(!blockerData || blockerData.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No blocker resolution data available</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Team Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {sprintData?.filter((m: any) => m.onTrack).length || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Members On Track</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">
                  {ownershipData?.filter((m: any) => m.ownershipScore >= 80).length || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">High Ownership</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">
                  {standupData?.filter((m: any) => m.preparedness === 'prepared').length || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Prepared Today</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">
                  {blockerData?.reduce((sum: number, resolver: any) => sum + resolver.blockersResolved, 0) || 0}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Blockers Resolved</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
