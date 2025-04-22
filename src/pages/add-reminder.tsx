
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import { HOME, MAINTENANCE_TASKS, addReminder } from "@/lib/data";
import { canAddReminder } from "@/lib/utils/subscription";

export default function AddReminder() {
  const navigate = useNavigate();
  const canAdd = canAddReminder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  
  const [formData, setFormData] = useState({
    task: "",
    startDate: tomorrow,
    frequency: "Yearly" as const
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAdd) {
      toast.error("Free tier limit reached. Please upgrade to Premium.");
      return;
    }
    
    if (!formData.task) {
      toast.error("Please enter a task description");
      return;
    }
    
    setIsSubmitting(true);
    
    // Add reminder
    addReminder({
      homeId: HOME.id,
      task: formData.task,
      startDate: formData.startDate,
      frequency: formData.frequency
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Reminder set successfully!");
      navigate("/dashboard");
    }, 800);
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
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
          <h1 className="text-xl font-semibold">Set Maintenance Reminder</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="task">Task Description</Label>
                  <Input
                    id="task"
                    placeholder="e.g., Replace HVAC Air Filter"
                    value={formData.task}
                    onChange={(e) => handleChange("task", e.target.value)}
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a description of the maintenance task (50 chars max)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    When do you want to be reminded about this task?
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => handleChange("frequency", value)}
                    disabled
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Currently, only yearly reminders are supported
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-zing-600 hover:bg-zing-700" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Setting Reminder..." : "Set Reminder"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
