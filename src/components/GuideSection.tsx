import type { ReactNode } from "react";

export function GuideSection({
  icon,
  title,
  color = "slate",
  children,
  index,
}: {
  icon: ReactNode;
  title: string;
  color?: "slate" | "blue" | "purple" | "green" | "amber";
  children: ReactNode;
  index?: number;
}) {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-900 text-white",
    blue: "bg-blue-600 text-white",
    purple: "bg-purple-600 text-white",
    green: "bg-green-600 text-white",
    amber: "bg-amber-500 text-white",
  };

  return (
    <section
      className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
      style={{ animationDelay: index ? `${index * 60}ms` : undefined }}
    >
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorMap[color]}`}>
          {icon}
        </span>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      <div className="prose-sm mt-3 space-y-2 pl-12 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  );
}

export function GuideStep({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
        {n}
      </span>
      <p>{children}</p>
    </div>
  );
}

export function GuideTip({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <span className="font-semibold">Tip: </span>
      {children}
    </div>
  );
}
