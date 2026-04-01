interface CodeLine {
  content: string;
  type: "key" | "value" | "string" | "comment" | "plain" | "url" | "header";
}

interface CodeBlockProps {
  lines: CodeLine[];
  className?: string;
}

export function CodeBlock({ lines, className = "" }: CodeBlockProps) {
  const colorMap: Record<CodeLine["type"], string> = {
    key: "text-[#F0F0F0]/60",
    value: "text-[#FFD600]",
    string: "text-[#F0F0F0]",
    comment: "text-[#666666]",
    plain: "text-[#F0F0F0]/80",
    url: "text-[#FFD600]",
    header: "text-[#F0F0F0]/50",
  };

  return (
    <div
      className={`bg-[#0A0A0A] rounded-none border-2 border-white/10 font-mono text-sm p-5 overflow-x-auto shadow-[6px_6px_0px_0px_rgba(255,214,0,0.18)] ${className}`}
    >
      <pre className="leading-6">
        {lines.map((line, i) => (
          <div key={i} className={colorMap[line.type]}>
            {line.content}
          </div>
        ))}
      </pre>
    </div>
  );
}
