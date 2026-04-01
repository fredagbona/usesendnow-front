interface CardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  elevated?: boolean
  dark?: boolean
  onClick?: () => void
}

export default function Card({ children, className = "", interactive, elevated, dark, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-none p-6 transition-all duration-150",
        dark
          ? "bg-neutral-dark border border-neutral-dark-hover text-white"
          : "bg-bg border border-border",
        elevated && !dark
          ? "shadow-[4px_4px_0px_0px_rgba(10,10,10,0.12)]"
          : "",
        interactive && !dark
          ? "hover:border-primary hover:-translate-y-0.5 cursor-pointer"
          : "",
        interactive && dark
          ? "hover:border-[#334155] cursor-pointer"
          : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  )
}
