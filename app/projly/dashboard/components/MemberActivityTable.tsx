'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, ExternalLink, AlertCircle } from "lucide-react";
import { useMemberActivityAnalytics } from "@/lib/services/projly/use-analytics";
import { useProfile } from "@/lib/services/projly/use-profile";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";

// Fix timezone offset using user's profile timezone preference
const fixTimezone = (utcDateString: string, userTimezone: number = 7): Date => {
  const dbDate = new Date(utcDateString);
  // Database stores local time as UTC, so subtract the timezone offset to get correct time
  return new Date(dbDate.getTime() - (userTimezone * 60 * 60 * 1000));
};

interface MemberActivity {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  teamName: string;
  teamId: string;
  lastAccessAt: string | null;
  lastTaskUpdateAt: string | null;
  lastCommentAt: string | null;
  lastActivityAt: string | null;
}

export function MemberActivityTable() {
  const { data: members, isLoading, error } = useMemberActivityAnalytics();
  const { data: profile } = useProfile();
  const [sortBy, setSortBy] = useState<'name' | 'lastAccess' | 'lastActivity'>('lastActivity');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: 'name' | 'lastAccess' | 'lastActivity') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedMembers = members ? [...members].sort((a: MemberActivity, b: MemberActivity) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.email;
        bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.email;
        break;
      case 'lastAccess':
        aValue = a.lastAccessAt ? new Date(a.lastAccessAt).getTime() : 0;
        bValue = b.lastAccessAt ? new Date(b.lastAccessAt).getTime() : 0;
        break;
      case 'lastActivity':
        aValue = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        bValue = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  }) : [];

  const getActivityStatus = (member: MemberActivity) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const lastActivity = member.lastActivityAt ? new Date(member.lastActivityAt) : null;
    
    if (!lastActivity) {
      return { status: 'inactive', label: 'No Activity', variant: 'secondary' as const };
    }
    
    if (lastActivity > oneDayAgo) {
      return { status: 'active', label: 'Active', variant: 'default' as const };
    } else if (lastActivity > threeDaysAgo) {
      return { status: 'recent', label: 'Recent', variant: 'outline' as const };
    } else if (lastActivity > oneWeekAgo) {
      return { status: 'stale', label: 'Stale', variant: 'secondary' as const };
    } else {
      return { status: 'inactive', label: 'Inactive', variant: 'destructive' as const };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Member Activity
          </CardTitle>
          <CardDescription>Track team member engagement and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !members) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Member Activity
          </CardTitle>
          <CardDescription>Track team member engagement and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Unable to load member activity data</p>
        </CardContent>
      </Card>
    );
  }

  const inactiveMembers = sortedMembers.filter(member => {
    const status = getActivityStatus(member);
    return status.status === 'inactive' || status.status === 'stale';
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Member Activity
        </CardTitle>
        <CardDescription>
          {members.length} team members • {inactiveMembers.length} need attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No team members found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Join a team to see member activity
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Alert for inactive members */}
            {inactiveMembers.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  {inactiveMembers.length} member{inactiveMembers.length > 1 ? 's' : ''} {inactiveMembers.length > 1 ? 'have' : 'has'} low activity
                </span>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold"
                    >
                      Member
                      {sortBy === 'name' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('lastAccess')}
                      className="h-auto p-0 font-semibold"
                    >
                      Last Access
                      {sortBy === 'lastAccess' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSort('lastActivity')}
                      className="h-auto p-0 font-semibold"
                    >
                      Last Activity
                      {sortBy === 'lastActivity' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member: MemberActivity) => {
                  const memberName = `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;
                  const initials = memberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  const activityStatus = getActivityStatus(member);

                  return (
                    <TableRow key={member.userId}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{memberName}</p>
                            <p className="text-xs text-muted-foreground">{member.teamName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {member.lastAccessAt ? (
                            <div>
                              <p>{formatDistanceToNow(fixTimezone(member.lastAccessAt, profile?.timezone || 7), { addSuffix: true })}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(fixTimezone(member.lastAccessAt, profile?.timezone || 7), 'MMM dd, HH:mm')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {member.lastActivityAt ? (
                            <div>
                              <p>{formatDistanceToNow(fixTimezone(member.lastActivityAt, profile?.timezone || 7), { addSuffix: true })}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(fixTimezone(member.lastActivityAt, profile?.timezone || 7), 'MMM dd, HH:mm')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No activity</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={activityStatus.variant}>
                          {activityStatus.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
