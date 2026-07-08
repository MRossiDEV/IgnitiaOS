import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

interface KPICardProps {
  label: string
  value: number | string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  suffix?: string
  prefix?: string
  color?: 'default' | 'success' | 'warning' | 'danger'
}

export function KPICard({
  label,
  value,
  icon,
  trend,
  suffix,
  prefix,
  color = 'default',
}: KPICardProps) {
  const colorClasses = {
    default: 'text-slate-900',
    success: 'text-green-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
  }

  const bgClasses = {
    default: 'bg-slate-50',
    success: 'bg-green-50',
    warning: 'bg-amber-50',
    danger: 'bg-red-50',
  }

  return (
    <Card className={bgClasses[color]}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
          {icon && <div className={`${colorClasses[color]} opacity-60`}>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className={`text-3xl font-bold ${colorClasses[color]}`}>
            {prefix}
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix}
          </span>
          {trend && (
            <span
              className={`text-xs font-semibold mb-1 ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TodayRevenueCard({ value }: { value: number }) {
  return (
    <KPICard
      label="Today's Revenue"
      value={value}
      prefix="$"
      icon={<DollarSign className="w-4 h-4" />}
      color="success"
    />
  )
}

export function MTDRevenueCard({ value }: { value: number }) {
  return (
    <KPICard
      label="MTD Revenue"
      value={value}
      prefix="$"
      icon={<TrendingUp className="w-4 h-4" />}
      color="success"
    />
  )
}

export function ActiveOrdersCard({ value }: { value: number }) {
  return (
    <KPICard
      label="Active Orders"
      value={value}
      icon={<TrendingUp className="w-4 h-4" />}
      color="default"
    />
  )
}

export function OrdersOverdueCard({ value }: { value: number }) {
  return (
    <KPICard
      label="Orders Overdue"
      value={value}
      icon={<AlertCircle className="w-4 h-4" />}
      color={value > 0 ? 'danger' : 'success'}
    />
  )
}

export function PendingPaymentsCard({ value }: { value: number }) {
  return (
    <KPICard
      label="Pending Payments"
      value={value}
      prefix="$"
      icon={<DollarSign className="w-4 h-4" />}
      color={value > 0 ? 'warning' : 'success'}
    />
  )
}
