import { Loader2, Bookmark } from 'lucide-react'

export default function SessionVerificationScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Verifying session"
      className="fixed inset-0 w-screen h-screen bg-[#1D1E1F] flex flex-col items-center justify-center z-[9999] select-none p-4"
    >
      {/* Brand row: Rounded purple/indigo square with Bookmark icon + Stashbox wordmark */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
          <Bookmark className="w-5 h-5 text-white stroke-[2.25]" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Stashbox
        </span>
      </div>

      {/* Status row: Smooth spinner + Verifying session... */}
      <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-[13px]">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400 stroke-[2] flex-shrink-0" />
        <span className="font-normal text-[#8e94a0] tracking-wide">
          Verifying session...
        </span>
      </div>
    </div>
  )
}
