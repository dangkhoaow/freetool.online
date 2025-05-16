'use client';

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Types
interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface ProfileSettingsProps {
  profile: ProfileData;
  onProfileChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

export function ProfileSettings({ 
  profile, 
  onProfileChange, 
  onSubmit,
  isSaving 
}: ProfileSettingsProps) {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:PROFILE_SETTINGS] ${message}`, data);
    } else {
      console.log(`[PROJLY:PROFILE_SETTINGS] ${message}`);
    }
  };
  
  // Handle avatar file upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      log('Invalid file type:', file.type);
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive'
      });
      return;
    }
    
    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      log('File too large:', file.size);
      toast({
        title: 'File too large',
        description: 'Please select an image under 2MB.',
        variant: 'destructive'
      });
      return;
    }
    
    log('Processing avatar file:', file.name);
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    
    // Convert file to base64 for API submission
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      log('Avatar converted to base64');
      onProfileChange('avatar', base64String);
    };
    reader.readAsDataURL(file);
  };
  
  // Get initials for avatar fallback
  const getInitials = () => {
    return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
  };
  
  // Clean up avatar preview URL when component unmounts
  // useEffect(() => {
  //   return () => {
  //     if (avatarPreview) {
  //       URL.revokeObjectURL(avatarPreview);
  //     }
  //   };
  // }, [avatarPreview]);
  
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-start">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={avatarPreview || profile.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`} 
                />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <Label 
                htmlFor="avatar" 
                className="cursor-pointer text-sm text-primary hover:underline"
              >
                Change Avatar
              </Label>
              <Input 
                id="avatar" 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isSaving}
              />
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => onProfileChange('firstName', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => onProfileChange('lastName', e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => onProfileChange('email', e.target.value)}
                  required
                  disabled={true} // Email typically shouldn't be editable
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email address
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
