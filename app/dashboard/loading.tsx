function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-8 w-64" />
            <SkeletonBlock className="h-4 w-full max-w-xl" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-9 w-28" />
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock className="h-32" key={index} />
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <SkeletonBlock className="h-[430px]" />
          <SkeletonBlock className="h-[260px]" />
        </div>

        <SkeletonBlock className="h-80" />
      </div>
    </main>
  );
}
