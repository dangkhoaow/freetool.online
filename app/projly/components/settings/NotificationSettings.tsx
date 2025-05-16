'use client';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, BellRing } from "lucide-react";

// Types
interface NotificationSettingsData {
  emailNotifications: boolean;
  taskAssignments: boolean;
  projectUpdates: boolean;
  dueDateReminders: boolean;
}

interface NotificationSettingsProps {
  settings: NotificationSettingsData;
  onSettingChange: (field: string, value: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSaving: boolean;
}

export function NotificationSettings({ 
  settings, 
  onSettingChange, 
  onSubmit,
  isSaving 
}: NotificationSettingsProps) {
  
  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:NOTIFICATION_SETTINGS] ${message}`, data);
    } else {
      console.log(`[PROJLY:NOTIFICATION_SETTINGS] ${message}`);
    }
  };
  
  // Handler for toggling notification settings
  const handleToggle = (field: string, value: boolean) => {
    log(`Toggling notification setting: ${field} to:`, value);
    onSettingChange(field, value);
  };
  
  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellRing className="mr-2 h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Customize how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Receive email notifications
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
              disabled={isSaving}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Task Assignments</h4>
              <p className="text-sm text-muted-foreground">
                Get notified when you are assigned to a task
              </p>
            </div>
            <Switch
              checked={settings.taskAssignments}
              onCheckedChange={(checked) => handleToggle('taskAssignments', checked)}
              disabled={isSaving}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Project Updates</h4>
              <p className="text-sm text-muted-foreground">
                Get notified about changes to projects you're involved in
              </p>
            </div>
            <Switch
              checked={settings.projectUpdates}
              onCheckedChange={(checked) => handleToggle('projectUpdates', checked)}
              disabled={isSaving}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Due Date Reminders</h4>
              <p className="text-sm text-muted-foreground">
                Receive reminders about upcoming task deadlines
              </p>
            </div>
            <Switch
              checked={settings.dueDateReminders}
              onCheckedChange={(checked) => handleToggle('dueDateReminders', checked)}
              disabled={isSaving}
            />
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
              'Save Preferences'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
