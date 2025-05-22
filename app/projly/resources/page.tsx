"use client";

import { useState } from "react";
import { ResourcesTable } from "../components/resources/ResourcesTable";
import { CreateResourceButton } from "../components/resources/CreateResourceButton";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Filter } from "lucide-react";
import { ResourceFilters } from "../components/resources/ResourceFilters";
import { DashboardLayout } from "../components/layout/DashboardLayout";

export default function Resources() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    fileType: "all_types",
    projectId: "all_projects",
  });
  
  // Log initial state
  console.log("[PROJLY:RESOURCES_PAGE] Initial filters:", filters);

  // Function to handle logging
  const log = (message: string, data?: any) => {
    if (data) {
      console.log(`[PROJLY:RESOURCES_PAGE] ${message}`, data);
    } else {
      console.log(`[PROJLY:RESOURCES_PAGE] ${message}`);
    }
  };

  const toggleFilters = () => {
    setShowFilters((prev) => {
      log("Toggling filter visibility", !prev);
      return !prev;
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilters}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <CreateResourceButton />
          </div>
        </div>

        {showFilters && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceFilters filters={filters} setFilters={(v) => {
                log("Updating filters", v);
                setFilters(v);
              }} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <ResourcesTable filters={filters} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
