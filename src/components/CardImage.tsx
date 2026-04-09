import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

/** Renders a stored image Blob with correct object URL lifecycle. */
export function CardImage({
  blob,
  alt,
  className,
}: {
  blob: Blob | undefined;
  alt: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt={alt}
      className={cn("max-h-48 w-full rounded-lg object-contain", className)}
    />
  );
}
