"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Factory, Users, Cpu, TrendingUp } from "lucide-react"

interface FactoryData {
  total_products: number
  overall_efficiency_percentage: number
  total_workers: number
  total_workstations: number
}

interface FactoryMetricsProps {
  data: FactoryData | undefined
  isLoading: boolean
  error: Error | undefined
}

export function FactoryMetrics({ data, isLoading, error }: FactoryMetricsProps) {
  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-destructive text-sm">Failed to load factory metrics</p>
        </CardContent>
      </Card>
    )
  }

  const metrics = [
    {
      label: "Total Units Produced",
      value: data ? data.total_products.toLocaleString() : "—",
      icon: Factory,
    },
    {
      label: "Average Utilization",
      value: data
        ? `${data.overall_efficiency_percentage.toFixed(2)}%`
        : "—",
      icon: TrendingUp,
    },
    {
      label: "Active Workers",
      value: data ? data.total_workers.toString() : "—",
      icon: Users,
    },
    {
      label: "Active Workstations",
      value: data ? data.total_workstations.toString() : "—",
      icon: Cpu,
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-md bg-primary/10">
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div>
              {isLoading ? (
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-2xl font-semibold text-foreground tabular-nums">
                  {metric.value}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {metric.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}