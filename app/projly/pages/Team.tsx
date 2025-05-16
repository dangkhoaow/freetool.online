
import { TeamsList } from "@/components/team/TeamsList";
import { MembersTable } from "@/components/team/MembersTable";

export default function Team() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Team Management</h1>
      </div>
      
      {/* Teams management section */}
      <div className="mb-8">
        <TeamsList />
      </div>
      
      {/* Team members section */}
      <div>
        <MembersTable />
      </div>
    </div>
  );
}
