type CheckIconProps = {
  className?: string;
  size?: number;
};

export function CheckIcon({ className = '', size = 14 }: CheckIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="8" cy="8" r="8" fill="var(--color-helfa-lime)" />
      <path
        d="M4.5 8.2L7 10.5L11.5 5.8"
        stroke="var(--color-helfa-ink)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
