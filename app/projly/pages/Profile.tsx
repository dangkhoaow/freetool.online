
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { getInitials } from "@/lib/get-initials";
import { useUserExtended } from "@/hooks/use-user-extended";
import { format } from "date-fns";

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { data: extendedUser, isLoading: isLoadingExtended } = useUserExtended();
  
  console.log("Rendering Profile page with user:", user);
  console.log("Extended user data:", extendedUser);
  
  // Show loading spinner while data is being fetched
  if (isLoading || isLoadingExtended) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">
                {getInitials(`${extendedUser?.profile?.firstName || ''} ${extendedUser?.profile?.lastName || ''}`)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {extendedUser?.profile?.firstName} {extendedUser?.profile?.lastName}
              </CardTitle>
              <p className="text-muted-foreground">{extendedUser?.email}</p>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd>{extendedUser?.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Member since</dt>
                <dd>
                  {extendedUser?.profile?.createdAt ? 
                    format(new Date(extendedUser.profile.createdAt), 'MMMM d, yyyy') : 
                    extendedUser?.createdAt ? 
                      format(new Date(extendedUser.createdAt), 'MMMM d, yyyy') : 
                      "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                <dd>{extendedUser?.role ? extendedUser.role.replace('_', ' ').toUpperCase() : 'N/A'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
