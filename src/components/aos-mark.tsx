import { cn } from "@/lib/utils";

export function AosMark({
  className,
  imageClassName,
  showRings = true,
}: {
  className?: string;
  imageClassName?: string;
  showRings?: boolean;
}) {
  return (
    <span className={cn("relative flex aspect-square items-center justify-center", className)}>
      {showRings && (
        <>
          <span className="absolute inset-0 rounded-full border border-amber/10" />
          <span className="absolute inset-5 rounded-full border border-amber/15" />
          <span className="absolute inset-10 rounded-full border border-amber/20" />
        </>
      )}
      <img
        src="/aos-logo.png"
        alt="AOS"
        className={cn(
          "relative z-10 aspect-square rounded-[1.25rem] object-cover shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
          imageClassName,
        )}
      />
    </span>
  );
}
