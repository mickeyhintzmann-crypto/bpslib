import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import type { ReferenceProject } from "@/lib/references-data";

type ReferencesGridProps = {
  projects: ReferenceProject[];
};

export const ReferencesGrid = ({ projects }: ReferencesGridProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <article
          key={project.id}
          id={project.id}
          className="overflow-hidden rounded-3xl border border-border/70 bg-white/85 shadow-sm"
        >
          <BpsImage
            src={project.image}
            alt={project.imageAlt}
            width={1200}
            height={900}
            className="h-48 w-full object-cover"
          />
          <div className="space-y-3 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {project.service}
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">{project.title}</h3>
            <p className="text-sm text-muted-foreground">Område: {project.location}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{project.scope}</p>
            <p className="rounded-xl bg-primary/5 px-3 py-2 text-sm text-foreground">{project.result}</p>
            <Link href={project.href} className="inline-flex text-sm font-semibold text-primary hover:underline">
              Se relateret case
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
};
