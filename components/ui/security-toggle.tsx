"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface SecurityToggleProps {
  title: string
  description?: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
  disabled?: boolean
  className?: string
}

export function SecurityToggle({
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: SecurityToggleProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Left content */}
      <div className="space-y-1">
        <Label className="text-sm font-medium">{title}</Label>

        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Toggle */}
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}