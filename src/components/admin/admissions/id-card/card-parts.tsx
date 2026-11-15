import { UserIcon } from "@/icons";
import { cn } from "@/utils";

// Shared pieces of the ID-proof preview cards. The cards are styled "paper"
// (always light) and deliberately carry no government emblems, logos, QR codes
// or signatures: they are a record copy of what was entered, not an ID.

export function CardFrame({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[86/54] w-full overflow-hidden rounded-2xl border border-gray-200 text-gray-900 shadow-theme-md select-none",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardPhoto({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-black/10 bg-gray-200",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <UserIcon className="size-1/2 text-gray-400" />
      )}
    </div>
  );
}

export function CardField({
  label,
  value,
  className,
  strong,
}: {
  label: string;
  value: string;
  className?: string;
  strong?: boolean;
}) {
  return (
    <div className={cn("min-w-0 leading-tight", className)}>
      <p className="text-[0.55rem] font-medium tracking-wide uppercase opacity-60">
        {label}
      </p>
      <p
        className={cn(
          "truncate text-[0.7rem]",
          strong ? "font-bold" : "font-semibold",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Thin strip that marks the card as an internal record copy. */
export function RecordStrip({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-center text-[0.5rem] font-semibold tracking-widest text-white uppercase",
        className,
      )}
    >
      ID proof record copy · not a valid identity document
    </p>
  );
}
