interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-8 gap-3">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-text tracking-tight leading-tight uppercase">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary mt-1">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center flex-wrap gap-2 sm:shrink-0">{action}</div>
      )}
    </div>
  )
}
