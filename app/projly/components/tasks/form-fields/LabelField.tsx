import React, { useState } from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Define industry categories with groups
const INDUSTRY_CATEGORIES = {
  "IT & Development": [
    "Backend Development",
    "Frontend Development",
    "DevOps",
    "QA & Testing",
    "System Architecture",
    "Database Management",
    "Mobile App Development",
    "API Development",
    "Cloud Infrastructure",
    "Security Implementation"
  ],
  "Business & Management": [
    "Business Requirements",
    "Business Analysis",
    "Project Management",
    "Resource Planning",
    "Stakeholder Management",
    "Risk Assessment",
    "Budget Management",
    "Change Management",
    "Strategy Planning"
  ],
  "Marketing & Sales": [
    "Content Marketing",
    "Social Media",
    "SEO/SEM",
    "Email Marketing",
    "Sales",
    "Customer Relations",
    "Market Research",
    "Brand Development",
    "Campaign Management"
  ],
  "Design & Creative": [
    "UI/UX Design",
    "Graphic Design",
    "Content Creation",
    "Video Production",
    "Animation",
    "Illustration",
    "Brand Identity"
  ],
  "Other": [
    "Research",
    "Documentation",
    "Training",
    "Support",
    "Custom"
  ]
};

interface LabelFieldProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function LabelField({ 
  value = null, 
  onChange 
}: LabelFieldProps) {
  const [customLabel, setCustomLabel] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  
  // Handle select change
  const handleSelectChange = (newValue: string) => {
    if (newValue === "Custom") {
      setIsCustom(true);
      // Don't update the value yet - wait for custom input
    } else {
      setIsCustom(false);
      onChange(newValue);
    }
  };
  
  // Handle custom input change
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomLabel(newValue);
    onChange(newValue);
  };
  
  return (
    <FormItem>
      <div className="space-y-2">
        <Label htmlFor="label">Category / Label</Label>
        
        <Select 
          value={isCustom ? "Custom" : (value || "")} 
          onValueChange={handleSelectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {Object.entries(INDUSTRY_CATEGORIES).map(([group, categories]) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        
        {isCustom && (
          <div className="mt-2">
            <Input
              placeholder="Enter custom label"
              value={customLabel}
              onChange={handleCustomInputChange}
            />
          </div>
        )}
      </div>
    </FormItem>
  );
} 