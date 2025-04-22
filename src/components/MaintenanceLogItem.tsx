
import { format, parseISO } from "date-fns";
import { MaintenanceLog, getTaskById, getTaskValueText } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { isPremium } from "@/lib/utils/subscription";
import { Badge } from "@/components/ui/badge";

interface MaintenanceLogItemProps {
  log: MaintenanceLog;
  onClick?: (log: MaintenanceLog) => void;
}

export function MaintenanceLogItem({ log, onClick }: MaintenanceLogItemProps) {
  const isUserPremium = isPremium();
  const task = log.taskId ? getTaskById(log.taskId) : null;
  const taskName = task ? task.name : log.customTask;
  const valueText = log.isPreloadedTask && log.taskId ? getTaskValueText(log.taskId) : null;
  const formattedDate = format(parseISO(log.date), "MM/dd/yy");
  
  return (
    <Card 
      className="cursor-pointer hover:bg-accent/30 transition-colors"
      onClick={() => onClick?.(log)}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{formattedDate}</span>
            <h3 className="font-medium">{taskName}</h3>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {log.cost && (
              <span>Cost: ${log.cost}</span>
            )}
            
            {isUserPremium && valueText && (
              <>
                <span className="text-muted-foreground">•</span>
                <Badge variant="outline" className="bg-value/10 text-value border-value">
                  Added {valueText}
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
