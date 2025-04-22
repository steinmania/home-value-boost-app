
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { MaintenanceLog, getTaskById } from "@/lib/data";
import { format, parseISO } from "date-fns";

// This is a placeholder component for future implementation
export default function TaskDetail() {
  const navigate = useNavigate();
  
  // Placeholder data (in a real app, this would come from route params/query)
  const mockLog: MaintenanceLog = {
    id: 'log1',
    homeId: 'home1',
    taskId: 'task1',
    customTask: null,
    date: '2025-04-15',
    cost: 25,
    photoUrl: null,
    isPreloadedTask: true
  };
  
  const task = mockLog.taskId ? getTaskById(mockLog.taskId) : null;
  const taskName = task ? task.name : mockLog.customTask;
  const formattedDate = format(parseISO(mockLog.date), "MMMM d, yyyy");
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="container px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Task Details</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{taskName}</h2>
                <p className="text-muted-foreground">{formattedDate}</p>
              </div>
              
              {task && (
                <div className="p-3 bg-value/10 rounded-md border border-value/20">
                  <p className="text-sm font-medium text-value">
                    Added ${task.valueMin} - ${task.valueMax} in home value
                  </p>
                </div>
              )}
              
              {mockLog.cost !== null && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="text-lg font-medium">${mockLog.cost}</p>
                  </div>
                </>
              )}
              
              {task && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Maintenance Tip</p>
                    <p className="text-md">{task.tip}</p>
                  </div>
                </>
              )}
              
              <div className="pt-4">
                <Button 
                  className="w-full bg-zing-600 hover:bg-zing-700"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
