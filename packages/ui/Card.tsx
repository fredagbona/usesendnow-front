import * as React from "react"

export interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return <section className={`border border-border bg-bg p-4 shadow-[3px_3px_0px_0px_rgba(10,10,10,0.08)] ${className}`}>{children}</section>
}
