
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HOME, MAINTENANCE_LOGS, REMINDERS } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, History, Calendar, Home } from "lucide-react";
import { MaintenanceLogItem } from "@/components/MaintenanceLogItem";
import { ReminderItem } from "@/components/ReminderItem";
import { EmptyState } from "@/components/EmptyState";
import { ValueDisplay } from "@/components/ValueDisplay";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("history");
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      
      <div className="container px-4 py-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Home Maintenance Tracker
            </h1>
            {HOME.address && (
              <p className="text-muted-foreground">{HOME.address}</p>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => navigate("/setup")}
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
        
        <ValueDisplay />
        
        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-lg font-medium">Your Maintenance</h2>
          
          <div className="flex gap-2">
            <Button 
              size="sm"
              className="gap-1 bg-zing-600 hover:bg-zing-700"
              onClick={() => navigate("/log-task")}
            >
              <Plus className="h-4 w-4" />
              Log Task
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              className="gap-1"
              onClick={() => navigate("/add-reminder")}
            >
              <Calendar className="h-4 w-4" />
              Add Reminder
            </Button>
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="mt-4"
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="reminders" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Reminders
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="history" className="mt-4 space-y-4">
            {MAINTENANCE_LOGS.length === 0 ? (
              <EmptyState
                icon={<History className="h-12 w-12 opacity-50" />}
                title="No maintenance logs yet"
                description="Start tracking your home maintenance to see its impact on your property's value."
                action={
                  <Button 
                    className="gap-1 bg-zing-600 hover:bg-zing-700"
                    onClick={() => navigate("/log-task")}
                  >
                    <Plus className="h-4 w-4" />
                    Log First Task
                  </Button>
                }
              />
            ) : (
              MAINTENANCE_LOGS.map(log => (
                <MaintenanceLogItem 
                  key={log.id} 
                  log={log}
                  onClick={() => toast.info("Task details view coming soon!")}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="reminders" className="mt-4 space-y-4">
            {REMINDERS.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-12 w-12 opacity-50" />}
                title="No reminders set"
                description="Create reminders for regular maintenance tasks to keep your home in top condition."
                action={
                  <Button
                    className="gap-1 bg-zing-600 hover:bg-zing-700"
                    onClick={() => navigate("/add-reminder")}
                  >
                    <Plus className="h-4 w-4" />
                    Add First Reminder
                  </Button>
                }
              />
            ) : (
              REMINDERS.map(reminder => (
                <ReminderItem key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
