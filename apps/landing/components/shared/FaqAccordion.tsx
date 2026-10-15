"use client"

import { useState } from "react"
import { Add01Icon, MinusSignIcon } from "hugeicons-react"

interface FaqAccordionProps {
  items: Array<{ question: string; answer: string }>
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={item.question} className="overflow-hidden border border-black/10 bg-[#FCFAF4]">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-(family-name:--font-geist-sans) text-base font-semibold text-[#171515]">{item.question}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-black/10 bg-white text-[#171515]">
                {isOpen ? <MinusSignIcon className="h-4 w-4" /> : <Add01Icon className="h-4 w-4" />}
              </span>
            </button>
            {isOpen ? (
              <div className="px-5 pb-5">
                <p className="max-w-3xl text-sm leading-6 text-[#625B54]">{item.answer}</p>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
