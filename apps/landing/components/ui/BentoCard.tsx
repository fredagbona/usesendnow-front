"use client";

import { motion } from "framer-motion";

interface BentoCardProps {
  children: React.ReactNode;
  rounded?: "sharp" | "rounded" | "large";
  accentLeft?: boolean;
  className?: string;
  elevated?: boolean;
}

export function BentoCard({
  children,
  rounded = "rounded",
  accentLeft = false,
  className = "",
  elevated = false,
}: BentoCardProps) {
  const radiusMap = {
    sharp: "rounded-none",
    rounded: "rounded-2xl",
    large: "rounded-3xl",
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden p-6
        border-2 border-white/10 shadow-[6px_6px_0px_0px_rgba(240,240,240,0.14)]
        ${elevated ? "bg-[#1A1A1A]" : "bg-white/[0.02]"}
        ${radiusMap[rounded]}
        ${accentLeft ? "border-l-4 border-l-[#FFD600]" : ""}
        ${className}
      `}
      whileHover={{ borderColor: "#FFD600", y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
