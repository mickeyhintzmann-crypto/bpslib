import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
};

export const PageShell = ({ title, children }: PageShellProps) => {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </main>
  );
};
