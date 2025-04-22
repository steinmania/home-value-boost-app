
import { calculateTotalValue, getMilestoneProgress } from "@/lib/data";
import { Progress } from "@/components/ui/progress";
import { PremiumFeature } from "@/components/PremiumFeature";

export function ValueDisplay() {
  const totalValue = calculateTotalValue();
  const milestoneProgress = getMilestoneProgress(totalValue);

  const ValueContent = () => (
    <div className="p-4 rounded-lg bg-white border shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Value Added</h3>
        <p className="text-3xl font-bold text-value">
          ${totalValue.min.toLocaleString()} - ${totalValue.max.toLocaleString()}
        </p>
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Milestone: $10,000</span>
          <span className="text-sm font-medium">{milestoneProgress}%</span>
        </div>
        <Progress value={milestoneProgress} className="h-2" />
      </div>
    </div>
  );

  return (
    <PremiumFeature 
      blurred={true}
      label="Unlock Value Tracking"
    >
      <ValueContent />
    </PremiumFeature>
  );
}
