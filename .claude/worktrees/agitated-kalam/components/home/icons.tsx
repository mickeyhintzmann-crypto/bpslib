import type { SVGProps } from "react";

export const SparklesIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M12 3l1.8 4.7L18 9.5l-4.2 1.7L12 16l-1.8-4.8L6 9.5l4.2-1.8L12 3z" />
    <path d="M5 17l.8 2 2 .8-2 .8L5 23l-.8-2-2-.8 2-.8.8-2z" />
  </svg>
);

export const ShieldIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <path d="M12 3l7 3v6c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9V6l7-3z" />
    <path d="M9.5 12.5l2 2 3.5-3.5" />
  </svg>
);

export const TimerIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
    <circle cx="12" cy="13" r="7" />
    <path d="M9 2h6" />
    <path d="M12 8v5l3 2" />
  </svg>
);

export const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M20 7L10 17l-6-6" />
  </svg>
);

export const StarIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 3l2.6 5.3 5.8.9-4.2 4.1 1 5.7L12 16l-5.2 3 1-5.7-4.2-4.1 5.8-.9L12 3z" />
  </svg>
);
