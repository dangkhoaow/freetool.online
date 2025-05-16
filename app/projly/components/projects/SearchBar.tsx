
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  search: string;
  setSearch: (value: string) => void;
}

export function SearchBar({ search, setSearch }: SearchBarProps) {
  return (
    <div className="flex gap-4">
      <Input 
        placeholder="Search projects..." 
        className="w-full md:w-1/3"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <Button 
        variant="outline" 
        onClick={() => setSearch("")} 
        className="ml-auto"
      >
        Clear
      </Button>
    </div>
  );
}
