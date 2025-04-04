"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Eye, Pencil, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface WorkflowListProps {
  pages: any[]
  status: string
}

export default function WorkflowList({ pages, status }: WorkflowListProps) {
  const router = useRouter()
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<any | null>(null)
  const [action, setAction] = useState<string | null>(null)
  const [comment, setComment] = useState("")

  const handleAction = async () => {
    if (!selectedPage || !action) return

    try {
      const response = await fetch("/api/workflow", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId: selectedPage.id,
          action,
          comment,
        }),
      })

      if (response.ok) {
        setIsCommentDialogOpen(false)
        router.refresh()
      } else {
        console.error("Failed to update workflow status")
      }
    } catch (error) {
      console.error("Error updating workflow status:", error)
    }
  }

  const openActionDialog = (page: any, actionType: string) => {
    setSelectedPage(page)
    setAction(actionType)
    setComment("")
    setIsCommentDialogOpen(true)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length > 0 ? (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>{page.createdBy?.name || "-"}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/${page.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/site-management/pages/${page.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </Link>
                      </Button>

                      {status === "PENDING" && (
                        <>
                          <Button variant="default" size="sm" onClick={() => openActionDialog(page, "APPROVE")}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => openActionDialog(page, "REJECT")}>
                            <XCircle className="mr-2 h-4 w-4" /> Reject
                          </Button>
                        </>
                      )}

                      {status === "APPROVED" && (
                        <Button variant="default" size="sm" onClick={() => openActionDialog(page, "PUBLISH")}>
                          <ArrowUpRight className="mr-2 h-4 w-4" /> Publish
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No pages with this status.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "APPROVE" ? "Approve Content" : action === "REJECT" ? "Reject Content" : "Publish Content"}
            </DialogTitle>
            <DialogDescription>
              {action === "APPROVE"
                ? "Approve this content to make it ready for publishing."
                : action === "REJECT"
                  ? "Provide a reason for rejecting this content."
                  : "Publish this content to make it live on the site."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Page: {selectedPage?.title}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Comment (optional)</p>
              <Textarea placeholder="Add a comment..." value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant={action === "REJECT" ? "destructive" : "default"} onClick={handleAction}>
              {action === "APPROVE" ? "Approve" : action === "REJECT" ? "Reject" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

