import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/devflow-logo.png"
        alt="DevFlow"
        width={compact ? 24 : 96}
        height={compact ? 24 : 32}
        className="object-contain"
        priority
      />
    </span>
  );
}
