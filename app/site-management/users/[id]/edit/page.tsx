import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import UserForm from "@/components/admin/user-form"

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  // Check if user has admin role
  if (session.user.role !== "ADMIN") {
    redirect("/site-management")
  }

  // Get the user to edit
  const user = await db.user.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit User: {user.name}</h1>
      <UserForm user={user} />
    </div>
  )
}

