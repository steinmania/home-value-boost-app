
import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPremium } from "@/lib/utils/subscription";
import { Button } from "@/components/ui/button";

interface PremiumFeatureProps {
  children: ReactNode;
  className?: string;
  blurred?: boolean;
  label?: string;
}

export function PremiumFeature({ 
  children, 
  className, 
  blurred = true,
  label = "Premium Feature"
}: PremiumFeatureProps) {
  const isUserPremium = isPremium();

  if (isUserPremium) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]",
        blurred ? "bg-background/80" : "bg-background/95"
      )}>
        <Lock className="h-6 w-6 text-value mb-2" />
        <p className="text-sm font-medium text-value">{label}</p>
        <Button size="sm" variant="outline" className="mt-2 bg-value/10 text-value border-value hover:bg-value/20">
          Upgrade
        </Button>
      </div>
      <div className="opacity-40 pointer-events-none">
        {children}
      </div>
    </div>
  );
}
