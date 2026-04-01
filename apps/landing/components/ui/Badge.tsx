interface BadgeProps {
  children: React.ReactNode;
  variant?: "accent" | "featured";
  className?: string;
}

export function Badge({ children, variant = "accent", className = "" }: BadgeProps) {
  const variants = {
    accent: "border border-[#FFD600]/40 text-[#FFD600] bg-[#FFD600]/8 text-sm px-4 py-1.5 rounded-full font-(family-name:--font-poppins)",
    featured: "bg-[#FFD600] text-black text-xs font-bold px-3 py-1 rounded-full font-(family-name:--font-geist-sans) uppercase tracking-[0.08em]",
  };

  return (
    <span className={`inline-flex items-center ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
