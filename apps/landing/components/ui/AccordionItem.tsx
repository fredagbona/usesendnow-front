"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Add01Icon, Cancel01Icon } from "hugeicons-react";

interface AccordionItemProps {
  question: string;
  answer: string;
}

export function AccordionItem({ question, answer }: AccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-black/10">
      <button
        className="w-full flex items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-(family-name:--font-geist-sans) font-semibold text-[#0B0E11] text-base pr-4">
          {question}
        </span>
        <span className="text-[#FFD600] shrink-0">
          {open ? <Cancel01Icon size={18} /> : <Add01Icon size={18} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="font-(family-name:--font-poppins) text-[#3D4450]/80 text-sm leading-7 pb-5">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
