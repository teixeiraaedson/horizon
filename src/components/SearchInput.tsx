"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

export const SearchInput = ({ value, onChange, placeholder = "Search transactions..." }: Props) => {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8 input-dark"
      />
    </div>
  );
};