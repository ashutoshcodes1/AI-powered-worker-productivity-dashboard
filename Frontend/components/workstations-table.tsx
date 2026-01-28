"use client"

type WorkstationRow = {
  station_id: string
  name: string
  occupancy_minutes: number
  utilization_percentage: number
  units_produced: number
  throughput_per_hour: number
  unique_workers: number
}

function safeNum(n: unknown, digits = 2) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0
  return v.toFixed(digits)
}

export function WorkstationsTable({
  data,
  isLoading,
  error,
}: {
  data: WorkstationRow[]
  isLoading: boolean
  error: any
}) {
  if (isLoading) return <div>Loading workstations…</div>
  if (error) return <div className="text-red-500">Failed to load workstations</div>

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Workstation</th>
              <th className="px-4 py-3 font-medium">Occupancy Time (min)</th>
              <th className="px-4 py-3 font-medium">Utilization %</th>
              <th className="px-4 py-3 font-medium">Units Produced</th>
              <th className="px-4 py-3 font-medium">Throughput / Hour</th>
              <th className="px-4 py-3 font-medium">Unique Workers</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s) => (
              <tr key={s.station_id} className="border-t border-border">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.occupancy_minutes}</td>
                <td className="px-4 py-3">
                  {safeNum(s.utilization_percentage, 2)}
                </td>
                <td className="px-4 py-3">{s.units_produced}</td>
                <td className="px-4 py-3">
                  {safeNum(s.throughput_per_hour, 2)}
                </td>
                <td className="px-4 py-3">{s.unique_workers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
