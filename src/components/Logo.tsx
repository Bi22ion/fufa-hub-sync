export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/fufa-logo-v2.png"
      alt="FUFA TV"
      className={`${className} rounded object-contain`}
    />
  );
}
