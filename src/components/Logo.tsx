
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  small?: boolean;
}

export function Logo({ className, small = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center justify-center rounded-md bg-zing-600 w-8 h-8 text-white font-bold">
        Z
      </div>
      {!small && <span className="font-bold tracking-tight text-xl">Zing</span>}
    </div>
  );
}
