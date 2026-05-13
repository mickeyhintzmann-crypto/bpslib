import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

type CalloutProps = {
  children: ReactNode;
  title?: string;
  className?: string;
};

export const Callout = ({ children, title, className }: CalloutProps) => {
  return (
    <aside className={cn("rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5", className)}>
      {title ? <p className="text-sm font-semibold text-foreground">{title}</p> : null}
      <div className={cn("text-sm leading-relaxed text-muted-foreground", title ? "mt-2" : null)}>
        {children}
      </div>
    </aside>
  );
};
