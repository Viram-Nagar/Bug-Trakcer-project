import { motion } from "framer-motion";

/*
  Skeleton — animated placeholder shown while content loads.
  Mimics the shape of real content so UI doesn't jump.
  
  shimmer effect = gradient that slides left to right
*/

// ── Base Shimmer Animation ────────────────────────────
function SkeletonBase({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-100
                     rounded-lg ${className}`}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r
                   from-transparent via-white/60 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

// ── Text Line Skeleton ────────────────────────────────
export function SkeletonText({ width = "100%", className = "" }) {
  return (
    <SkeletonBase className={`h-4 rounded-md ${className}`} style={{ width }} />
  );
}

// ── Circle Skeleton (avatars) ─────────────────────────
export function SkeletonCircle({ size = 40 }) {
  return (
    <SkeletonBase
      className="rounded-full flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}

// ── Box Skeleton ──────────────────────────────────────
export function SkeletonBox({ height = 100, className = "" }) {
  return (
    <SkeletonBase
      className={`w-full rounded-xl ${className}`}
      style={{ height }}
    />
  );
}

// ── Project Card Skeleton ─────────────────────────────
export function ProjectCardSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100
                    p-5 shadow-sm"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <SkeletonBase className="w-12 h-12 rounded-xl" />
        <SkeletonBase className="w-16 h-6 rounded-full" />
      </div>

      {/* Title */}
      <SkeletonBase className="h-5 w-3/4 rounded-md mb-2" />

      {/* Description */}
      <SkeletonBase className="h-4 w-full rounded-md mb-1.5" />
      <SkeletonBase className="h-4 w-2/3 rounded-md mb-5" />

      {/* Color bar */}
      <SkeletonBase className="h-1 w-full rounded-full mb-5" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((i) => (
            <SkeletonBase
              key={i}
              className="w-7 h-7 rounded-full border-2 border-white"
              style={{ marginLeft: i > 1 ? "-8px" : "0" }}
            />
          ))}
        </div>
        <SkeletonBase className="h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}

// ── Ticket Card Skeleton ──────────────────────────────
export function TicketCardSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100
                    p-4 shadow-sm"
    >
      {/* Top */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-5 h-5 rounded" />
          <SkeletonBase className="w-10 h-4 rounded" />
          <SkeletonBase className="w-16 h-5 rounded-full" />
        </div>
        <SkeletonBase className="w-6 h-6 rounded-lg" />
      </div>

      {/* Title */}
      <SkeletonBase className="h-4 w-full rounded mb-1.5" />
      <SkeletonBase className="h-4 w-3/4 rounded mb-3" />

      {/* Description */}
      <SkeletonBase className="h-3 w-full rounded mb-1" />
      <SkeletonBase className="h-3 w-2/3 rounded mb-3" />

      {/* Status */}
      <SkeletonBase className="h-6 w-24 rounded-full mb-3" />

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3
                      border-t border-gray-50"
      >
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-6 h-6 rounded-full" />
          <SkeletonBase className="w-20 h-3 rounded" />
        </div>
        <SkeletonBase className="w-16 h-3 rounded" />
      </div>
    </div>
  );
}

// ── Kanban Card Skeleton ──────────────────────────────
export function KanbanCardSkeleton() {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100
                    p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-5 h-5 rounded" />
          <SkeletonBase className="w-10 h-3 rounded" />
        </div>
        <SkeletonBase className="w-5 h-5 rounded" />
      </div>
      <SkeletonBase className="h-4 w-full rounded mb-1.5" />
      <SkeletonBase className="h-4 w-2/3 rounded mb-3" />
      <SkeletonBase className="h-5 w-16 rounded-full mb-3" />
      <div
        className="flex items-center justify-between pt-2.5
                      border-t border-gray-50"
      >
        <div className="flex items-center gap-1.5">
          <SkeletonBase className="w-5 h-5 rounded-full" />
          <SkeletonBase className="w-16 h-3 rounded" />
        </div>
        <SkeletonBase className="w-12 h-3 rounded" />
      </div>
    </div>
  );
}

// ── Dashboard Skeleton ────────────────────────────────
export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome banner */}
      <SkeletonBase className="h-36 w-full rounded-2xl" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border
                                   border-gray-100 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <SkeletonBase className="h-4 w-24 rounded" />
              <SkeletonBase className="w-10 h-10 rounded-xl" />
            </div>
            <SkeletonBase className="h-8 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-5 space-y-3"
        >
          <SkeletonBase className="h-5 w-40 rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 py-2">
              <SkeletonBase className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBase className="h-4 w-3/4 rounded" />
                <SkeletonBase className="h-3 w-1/2 rounded" />
              </div>
              <SkeletonBase className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <div
          className="bg-white rounded-2xl border border-gray-100
                        shadow-sm p-5 space-y-4"
        >
          <SkeletonBase className="h-5 w-40 rounded" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <SkeletonBase className="h-4 w-20 rounded" />
                <SkeletonBase className="h-4 w-12 rounded" />
              </div>
              <SkeletonBase className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Ticket Detail Skeleton ────────────────────────────
export function TicketDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <SkeletonBase className="h-5 w-32 rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          <div
            className="bg-white rounded-2xl border border-gray-100
                          p-6 shadow-sm space-y-4"
          >
            <SkeletonBase className="h-3 w-40 rounded" />
            <div className="flex gap-2">
              <SkeletonBase className="h-6 w-20 rounded-full" />
              <SkeletonBase className="h-6 w-20 rounded-full" />
            </div>
            <SkeletonBase className="h-8 w-3/4 rounded" />
            <SkeletonBase className="h-8 w-1/2 rounded" />
            <div className="space-y-2 pt-2">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBase
                  key={i}
                  className={`h-4 rounded
                    ${i === 4 ? "w-2/3" : "w-full"}`}
                />
              ))}
            </div>
          </div>
          <div
            className="bg-white rounded-2xl border border-gray-100
                          p-6 shadow-sm space-y-4"
          >
            <SkeletonBase className="h-5 w-32 rounded" />
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <SkeletonBase
                  className="w-8 h-8 rounded-full
                                         flex-shrink-0"
                />
                <SkeletonBase className="h-16 flex-1 rounded-xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {[120, 180, 200, 160].map((h, i) => (
            <SkeletonBase
              key={i}
              className="w-full rounded-2xl"
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Comment Skeleton ──────────────────────────────────
export function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <SkeletonBase className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-3 w-24 rounded" />
          <SkeletonBase className="h-3 w-16 rounded" />
        </div>
        <SkeletonBase className="h-16 w-full rounded-xl" />
        <div className="flex gap-3">
          <SkeletonBase className="h-3 w-12 rounded" />
          <SkeletonBase className="h-3 w-10 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Kanban Column Skeleton ────────────────────────────
export function KanbanBoardSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="min-w-[300px] w-[300px] flex-shrink-0">
          {/* Column header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <SkeletonBase className="w-2.5 h-2.5 rounded-full" />
              <SkeletonBase className="h-4 w-24 rounded" />
              <SkeletonBase className="h-5 w-7 rounded-full" />
            </div>
            <SkeletonBase className="w-7 h-7 rounded-lg" />
          </div>

          {/* Cards */}
          <div
            className="bg-gray-50 rounded-2xl p-3 space-y-3
                          min-h-[500px]"
          >
            {Array.from({
              length: col === 1 ? 3 : col === 2 ? 2 : col === 3 ? 1 : 2,
            }).map((_, i) => (
              <KanbanCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonBase;
