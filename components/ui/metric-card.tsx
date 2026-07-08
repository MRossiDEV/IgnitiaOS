"use client"

import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("rounded-xl border bg-white shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          {/* Left content */}
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>

            <p className="text-2xl font-semibold mt-1">
              {value}
            </p>

            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}

            {trend && (
              <div
                className={cn(
                  "text-xs mt-2 font-medium",
                  trend.positive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </div>
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}