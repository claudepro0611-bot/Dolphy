import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-muted",
        className
      )}
    />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 space-y-3", className)}>
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  )
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-4 px-5 py-4 animate-pulse", className)}>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
  )
}

export function SkeletonList({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow
          key={i}
          className={i < rows - 1 ? "border-b border-border" : ""}
        />
      ))}
    </div>
  )
}
