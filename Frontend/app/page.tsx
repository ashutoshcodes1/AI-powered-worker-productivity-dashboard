"use client"

import { useState } from "react"
import useSWR from "swr"
import { FactoryMetrics } from "@/components/factory-metrics"
import { WorkersTable } from "@/components/workers-table"
import { WorkstationsTable } from "@/components/workstations-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API_BASE = "https://worker-backend-xszq.onrender.com"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Dashboard() {
  const [selectedWorker, setSelectedWorker] = useState<string>("all")
  const [selectedWorkstation, setSelectedWorkstation] = useState<string>("all")

  const { data: factoryData, error: factoryError, isLoading: factoryLoading } =
    useSWR(`${API_BASE}/metrics/factory`, fetcher, { refreshInterval: 5000 })

  const { data: workersData, error: workersError, isLoading: workersLoading } =
    useSWR(`${API_BASE}/metrics/workers`, fetcher, { refreshInterval: 5000 })

  const {
    data: workstationsData,
    error: workstationsError,
    isLoading: workstationsLoading,
  } = useSWR(`${API_BASE}/metrics/workstations`, fetcher, {
    refreshInterval: 5000,
  })

  const filteredWorkers =
    selectedWorker === "all"
      ? workersData?.workers ?? []
      : (workersData?.workers ?? []).filter(
          (w: { worker_id: string }) => w.worker_id === selectedWorker
        )

  const filteredWorkstations =
    selectedWorkstation === "all"
      ? workstationsData?.workstations ?? []
      : (workstationsData?.workstations ?? []).filter(
          (s: { station_id: string }) =>
            s.station_id === selectedWorkstation
        )

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Factory Productivity
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time monitoring of factory performance
        </p>
      </header>

      {/* Factory Summary */}
      <section className="mb-8">
        <FactoryMetrics
          data={factoryData}
          isLoading={factoryLoading}
          error={factoryError}
        />
      </section>

      {/* Workers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Workers</h2>
          <Select value={selectedWorker} onValueChange={setSelectedWorker}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select worker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workers</SelectItem>
              {workersData?.workers?.map(
                (worker: { worker_id: string; name: string }) => (
                  <SelectItem
                    key={worker.worker_id}
                    value={worker.worker_id}
                  >
                    {worker.name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <WorkersTable
          data={filteredWorkers}
          isLoading={workersLoading}
          error={workersError}
        />
      </section>

      {/* Workstations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Workstations</h2>
          <Select
            value={selectedWorkstation}
            onValueChange={setSelectedWorkstation}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select workstation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workstations</SelectItem>
              {workstationsData?.workstations?.map(
                (ws: { station_id: string; name: string }) => (
                  <SelectItem
                    key={ws.station_id}
                    value={ws.station_id}
                  >
                    {ws.name}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <WorkstationsTable
          data={filteredWorkstations}
          isLoading={workstationsLoading}
          error={workstationsError}
        />
      </section>
    </div>
  )
}
