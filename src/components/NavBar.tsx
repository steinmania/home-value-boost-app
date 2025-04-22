
import { Logo } from "@/components/Logo";
import { getSubscriptionDetails } from "@/lib/utils/subscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NavBar() {
  const { type, isLimited } = getSubscriptionDetails();

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-sm text-muted-foreground">Home Maintenance</span>
        </div>
        <div className="flex items-center gap-4">
          {isLimited ? (
            <Button size="sm" variant="outline" className="gap-2">
              <Badge variant="outline" className="bg-value/10 text-value border-value">
                Free
              </Badge>
              Upgrade
            </Button>
          ) : (
            <Badge variant="default" className="bg-value">Premium</Badge>
          )}
        </div>
      </div>
    </header>
  );
}
