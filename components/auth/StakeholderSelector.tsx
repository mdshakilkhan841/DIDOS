import React from "react";
import { Building2, ShoppingBag, Handshake, GraduationCap, Wrench, ShieldCheck } from "lucide-react";
import { StakeholderRole, STAKEHOLDER_CONFIGS } from "@/types/auth";
import { cn } from "@/lib/utils";

interface StakeholderSelectorProps {
  selectedRole: StakeholderRole;
  onSelect: (role: StakeholderRole) => void;
  variant?: "tabs" | "grid";
}

const ROLE_ICONS: Record<StakeholderRole, React.ComponentType<{ className?: string }>> = {
  client: Building2,
  merchant: ShoppingBag,
  partner: Handshake,
  academy: GraduationCap,
  staff: Wrench,
  executive: ShieldCheck,
};

const ORDERED_ROLES: StakeholderRole[] = [
  "client",
  "merchant",
  "partner",
  "academy",
  "staff",
  "executive",
];

export function StakeholderSelector({
  selectedRole,
  onSelect,
  variant = "tabs",
}: StakeholderSelectorProps) {
  if (variant === "grid") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ORDERED_ROLES.map((role) => {
          const config = STAKEHOLDER_CONFIGS[role];
          const Icon = ROLE_ICONS[role];
          const isSelected = selectedRole === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onSelect(role)}
              className={cn(
                "flex flex-col items-start p-3 text-left rounded-xl border transition-all text-xs cursor-pointer",
                isSelected
                  ? "border-dudos-primary bg-dudos-surface-mint text-dudos-text shadow-sm ring-1 ring-dudos-primary"
                  : "border-dudos-border bg-white text-dudos-text-secondary hover:border-dudos-primary/40 hover:bg-dudos-surface-alt"
              )}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                    isSelected ? "bg-dudos-primary text-white" : "bg-dudos-surface text-dudos-text-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                    isSelected
                      ? "bg-dudos-primary/15 text-dudos-primary"
                      : "bg-dudos-surface text-dudos-text-secondary"
                  )}
                >
                  {config.badge}
                </span>
              </div>
              <span className="font-semibold text-dudos-text line-clamp-1">{config.title.split("/")[0]}</span>
              <span className="text-[11px] text-dudos-text-secondary line-clamp-1 mt-0.5">{config.shortDesc}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-dudos-text-secondary">
          Select Your Stakeholder Role
        </label>
        <span className="text-xs text-dudos-primary font-medium">
          {STAKEHOLDER_CONFIGS[selectedRole].badge}
        </span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {ORDERED_ROLES.map((role) => {
          const config = STAKEHOLDER_CONFIGS[role];
          const Icon = ROLE_ICONS[role];
          const isSelected = selectedRole === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onSelect(role)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-all cursor-pointer",
                isSelected
                  ? "border-dudos-primary bg-dudos-primary text-white shadow-sm"
                  : "border-dudos-border bg-white text-dudos-text-secondary hover:border-dudos-border hover:bg-dudos-surface"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{config.title.split("/")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
