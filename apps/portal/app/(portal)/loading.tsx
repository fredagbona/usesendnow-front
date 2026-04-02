export default function PortalLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="h-9 w-64 rounded-none bg-bg-muted" />
          <div className="h-4 w-80 max-w-full rounded-none bg-bg-muted" />
        </div>
        <div className="h-10 w-40 rounded-none bg-bg-muted" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="border border-border bg-bg p-5 rounded-none space-y-4">
            <div className="h-5 w-28 rounded-none bg-bg-muted" />
            <div className="h-8 w-16 rounded-none bg-bg-muted" />
            <div className="h-3 w-32 rounded-none bg-bg-muted" />
          </div>
        ))}
      </div>

      <div className="border border-border bg-bg p-5 rounded-none">
        <div className="space-y-4">
          <div className="h-5 w-40 rounded-none bg-bg-muted" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="grid grid-cols-[1.2fr_0.8fr_0.8fr] gap-4">
                <div className="h-10 rounded-none bg-bg-muted" />
                <div className="h-10 rounded-none bg-bg-muted" />
                <div className="h-10 rounded-none bg-bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
