"use client"

type WorkerRow = {
  worker_id: string
  name: string
  active_minutes: number
  idle_minutes: number
  utilization_percentage: number
  units_produced: number
  units_per_hour: number
  average_confidence: number
}

function safeNum(n: unknown, digits = 2) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0
  return v.toFixed(digits)
}

export function WorkersTable({
  data,
  isLoading,
  error,
}: {
  data: WorkerRow[]
  isLoading: boolean
  error: any
}) {
  if (isLoading) return <div>Loading workers…</div>
  if (error) return <div className="text-red-500">Failed to load workers</div>

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Worker</th>
              <th className="px-4 py-3 font-medium">Active Time (min)</th>
              <th className="px-4 py-3 font-medium">Idle Time (min)</th>
              <th className="px-4 py-3 font-medium">Utilization %</th>
              <th className="px-4 py-3 font-medium">Units Produced</th>
              <th className="px-4 py-3 font-medium">Units / Hour</th>
              <th className="px-4 py-3 font-medium">Avg Confidence</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((w) => (
              <tr key={w.worker_id} className="border-t border-border">
                <td className="px-4 py-3">{w.name}</td>
                <td className="px-4 py-3">{w.active_minutes}</td>
                <td className="px-4 py-3">{w.idle_minutes}</td>
                <td className="px-4 py-3">
                  {safeNum(w.utilization_percentage, 2)}
                </td>
                <td className="px-4 py-3">{w.units_produced}</td>
                <td className="px-4 py-3">
                  {safeNum(w.units_per_hour, 2)}
                </td>
                <td className="px-4 py-3">
                  {safeNum(w.average_confidence, 3)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
