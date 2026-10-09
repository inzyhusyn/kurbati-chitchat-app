import { User } from "lucide-react";

/** Rounded-square avatar; shows a neutral placeholder when no photo is set. */
export function Avatar({
  src,
  alt,
  className = "h-full w-full",
}: {
  src?: string | null | undefined;
  alt: string;
  className?: string;
}) {
  if (src) return <img src={src} alt={alt} className={`${className} object-cover`} />;
  return (
    <div role="img" aria-label={alt} className={`${className} grid place-items-center bg-muted text-muted-foreground`}>
      <User className="h-1/2 w-1/2" />
    </div>
  );
}
