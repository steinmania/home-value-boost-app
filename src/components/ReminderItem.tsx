
import { format, parseISO } from "date-fns";
import { Reminder } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

interface ReminderItemProps {
  reminder: Reminder;
}

export function ReminderItem({ reminder }: ReminderItemProps) {
  const formattedDate = format(parseISO(reminder.startDate), "MM/dd/yyyy");
  
  return (
    <Card className="border-l-4 border-l-zing-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-zing-500 mt-0.5" />
          <div>
            <h3 className="font-medium">{reminder.task}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Due: {formattedDate}</span>
              <span>•</span>
              <span>Yearly</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
