"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Snowflake,
  Armchair,
  Bed,
  Users,
  Star,
  OptionIcon,
  DotSquareIcon,
  DotSquare,
} from "lucide-react";
import { useState } from "react";
import { FaFoursquare } from "react-icons/fa";
import { IoIosOptions } from "react-icons/io";

export const classIcons = {
  "1A": Star,        // First AC (premium)
  "2A": Snowflake,   // AC 2-tier
  "3A": Snowflake,   // AC 3-tier
  EC: Armchair,      // Executive Chair Car
  CC: Armchair,      // Chair Car
  SL: Bed,           // Sleeper
  GE: Users,         // General
};

const classOptions = ["CC", "EC", "SL", "GE", "3A", "2A", "1A"];

export default function ClassDropdown({ filters, setFilters }) {

  return (
    <Select
      value={filters.class || ""}
      onValueChange={(value) =>
        setFilters((prev) => ({
          ...prev,
          class: value,
        }))
      }
    >
      {/* Trigger */}
      <SelectTrigger
        className="w-[104px] h-8 justify-between bg-gray-200 border-none rounded-bl-lg rounded-tl-none rounded-r-none shadow-none px-5 text-xs text-gray-700  font-semibold focus:ring-0 focus:ring-offset-0"
      >

        <SelectValue
          placeholder="Class"
          className="truncate "

        />
      </SelectTrigger>

      {/* Dropdown */}
      <SelectContent className="w-[90px] border-none shadow-none bg-gray-200">
        {classOptions.map((cls) => {
          const Icon = classIcons[cls];

          return (
            <SelectItem
              key={cls}
              value={cls}

              className="focus:bg-gray-300"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3 h-3" />
                {cls}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
