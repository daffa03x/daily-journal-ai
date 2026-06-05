function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function JournalLoading() {
  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-8 w-32" />
          </div>
          <SkeletonBlock className="h-9 w-28 sm:hidden" />
        </header>

        <SkeletonBlock className="h-28" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock className="h-7 w-20 rounded-full" key={index} />
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock className="h-36" key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
