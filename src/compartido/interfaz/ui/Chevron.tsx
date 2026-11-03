/** Flechita pequeña (›) que usan los enlaces y botones al pasar el mouse. */
export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 5 10"
      fill="none"
      className={`h-2 w-1 shrink-0 ${className}`}
    >
      <path
        d="m1 9 2.384-2.384a2.286 2.286 0 0 0 0-3.232L1 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
