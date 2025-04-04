import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import UserForm from "@/components/admin/user-form"

export default async function NewUserPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/site-management/login")
  }

  // Check if user has admin role
  if (session.user.role !== "ADMIN") {
    redirect("/site-management")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New User</h1>
      <UserForm />
    </div>
  )
}

