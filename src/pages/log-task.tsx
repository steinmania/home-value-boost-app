
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { MAINTENANCE_TASKS, addLog, getTaskById, getDefaultProperty } from "@/lib/data";
import { canAddLog } from "@/lib/utils/subscription";

export default function LogTask() {
  const navigate = useNavigate();
  const canAdd = canAddLog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    taskId: "",
    customTask: "",
    date: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    notes: ""
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAdd) {
      toast.error("Free tier limit reached. Please upgrade to Premium.");
      return;
    }
    
    if (!formData.taskId && !formData.customTask) {
      toast.error("Please select a task or enter a custom task");
      return;
    }
    
    setIsSubmitting(true);
    
    const taskId = formData.taskId || null;
    const isPreloadedTask = Boolean(taskId);
    const task = taskId ? getTaskById(taskId) : null;
    
    // Add log
    addLog({
      propertyId: getDefaultProperty().id,
      taskId,
      customTask: formData.customTask || null,
      date: formData.date,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      photoUrl: null, // Photo upload not implemented in this prototype
      isPreloadedTask
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      
      if (isPreloadedTask && task) {
        toast.success(`Added task: ${task.name} (+$${task.valueMin}-${task.valueMax} value)`);
      } else {
        toast.success("Task logged successfully!");
      }
      
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
          <h1 className="text-xl font-semibold">Log Maintenance Task</h1>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="task">Select Task</Label>
                  <Select
                    value={formData.taskId}
                    onValueChange={(value) => handleChange("taskId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a maintenance task" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_TASKS.map(task => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customTask">Or Enter Custom Task</Label>
                  <Input
                    id="customTask"
                    placeholder="e.g., Replace smoke detector batteries"
                    value={formData.customTask}
                    onChange={(e) => handleChange("customTask", e.target.value)}
                    maxLength={50}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date Completed</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="0.00"
                      className="pl-7"
                      value={formData.cost}
                      onChange={(e) => handleChange("cost", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any details about the maintenance task..."
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-zing-600 hover:bg-zing-700" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging Task..." : "Save Maintenance Log"}
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
