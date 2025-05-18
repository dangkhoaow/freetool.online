import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"
import { useAuth } from "@/app/projly/contexts/AuthContextCustom"

// Utility to derive initials from full name or fallback
function getInitials(name?: string, fallback: string = 'U'): string {
  console.log("[PROJLY:AVATAR] getInitials input:", name);
  if (!name) {
    console.log("[PROJLY:AVATAR] using fallback:", fallback);
    return fallback;
  }
  const parts = name.trim().split(/\s+/);
  let initials;
  if (parts.length === 1) {
    initials = parts[0].charAt(0).toUpperCase();
  } else {
    initials = parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
  }
  console.log("[PROJLY:AVATAR] computed initials:", initials);
  return initials;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { user, isLoading } = useAuth();
  console.log("[PROJLY:AVATAR] auth state - user:", user, "isLoading:", isLoading);
  
  // Only compute fullName if user exists and has name properties
  const fullName = user ? 
    `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
    undefined;
  
  console.log("[PROJLY:AVATAR] fullName:", fullName);
  
  // Use email as fallback if available
  const emailFallback = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const initials = getInitials(fullName, emailFallback);
  
  console.log("[PROJLY:AVATAR] initials for display:", initials);
  
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {/* Display user initials as fallback; no image source available */}
      <AvatarPrimitive.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted"
        )}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => {
  // Only use useAuth if we don't have children props
  // This prevents unnecessary context usage when initials are passed directly
  if (!props.children) {
    const { user } = useAuth();
    console.log("[PROJLY:AVATAR_FALLBACK] Getting user data for fallback");
    
    // Only compute fullName if user exists and has name properties
    const fullName = user ? 
      `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
      undefined;
    
    // Use email as fallback if available
    const emailFallback = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
    const initials = getInitials(fullName, emailFallback);
    
    console.log("[PROJLY:AVATAR_FALLBACK] Using initials:", initials);
    
    return (
      <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-muted",
          className
        )}
        {...props}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    );
  }
  
  // If children are provided, use them directly
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  );
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
