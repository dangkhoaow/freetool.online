"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Check, Trash2, Settings } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ThemesListProps {
  themes: any[]
}

export default function ThemesList({ themes }: ThemesListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [themeToDelete, setThemeToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!themeToDelete) return

    try {
      const response = await fetch(`/api/themes/${themeToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to delete theme")
      }
    } catch (error) {
      console.error("Error deleting theme:", error)
    } finally {
      setIsDeleteDialogOpen(false)
      setThemeToDelete(null)
    }
  }

  const activateTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/themes/${themeId}/activate`, {
        method: "PUT",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to activate theme")
      }
    } catch (error) {
      console.error("Error activating theme:", error)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.length > 0 ? (
          themes.map((theme) => (
            <Card key={theme.id} className={theme.status === "ACTIVE" ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{theme.name}</CardTitle>
                    <CardDescription>Version {theme.version}</CardDescription>
                  </div>
                  {theme.status === "ACTIVE" && <Badge>Active</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{theme.description || "No description provided"}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Installed: {format(new Date(theme.installedAt), "PP")}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/site-management/themes/${theme.id}/customize`)}
                >
                  <Settings className="mr-2 h-4 w-4" /> Customize
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {theme.status !== "ACTIVE" && (
                      <DropdownMenuItem onClick={() => activateTheme(theme.id)}>
                        <Check className="mr-2 h-4 w-4" /> Activate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setThemeToDelete(theme.id)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No themes installed.</p>
            <p className="text-muted-foreground mt-2">Browse the marketplace to find and install themes.</p>
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the theme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

