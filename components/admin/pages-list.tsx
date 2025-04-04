"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Eye, Trash2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
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
import { useRouter } from "next/navigation"

interface PagesListProps {
  pages: any[]
}

export default function PagesList({ pages }: PagesListProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!pageToDelete) return

    try {
      const response = await fetch(`/api/pages/${pageToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to delete page")
      }
    } catch (error) {
      console.error("Error deleting page:", error)
    } finally {
      setIsDeleteDialogOpen(false)
      setPageToDelete(null)
    }
  }

  const handleWorkflowAction = async (pageId: string, action: string) => {
    try {
      const response = await fetch("/api/workflow", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId,
          action,
        }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        console.error("Failed to update workflow status")
      }
    } catch (error) {
      console.error("Error updating workflow status:", error)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length > 0 ? (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{page.slug}</TableCell>
                  <TableCell>{page.parent?.title || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        page.status === "PUBLISHED"
                          ? "default"
                          : page.status === "APPROVED"
                            ? "success"
                            : page.status === "PENDING"
                              ? "warning"
                              : page.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                      }
                    >
                      {page.status.charAt(0) + page.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}</TableCell>
                  <TableCell>{page.createdBy?.name || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/site-management/pages/${page.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${page.slug}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" /> View
                          </Link>
                        </DropdownMenuItem>
                        {page.status === "DRAFT" && (
                          <DropdownMenuItem onClick={() => handleWorkflowAction(page.id, "SUBMIT")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Submit for Approval
                          </DropdownMenuItem>
                        )}
                        {page.status === "PENDING" && (
                          <>
                            <DropdownMenuItem onClick={() => handleWorkflowAction(page.id, "APPROVE")}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleWorkflowAction(page.id, "REJECT")}>
                              <XCircle className="mr-2 h-4 w-4" /> Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {page.status === "APPROVED" && (
                          <DropdownMenuItem onClick={() => handleWorkflowAction(page.id, "PUBLISH")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setPageToDelete(page.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No pages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the page and all its content.
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

