
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateHome } from "@/lib/data";

export default function Setup() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    // Update home address
    updateHome(address.trim() || null);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Home configured successfully!");
      navigate("/dashboard");
    }, 800);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-zing-50 to-white">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo className="mb-2" />
          <h1 className="text-2xl font-bold">Welcome to Zing!</h1>
          <p className="text-muted-foreground text-center mt-1">
            Let's set up your home
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Home Setup</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Home Address (Optional)</Label>
                <Input 
                  id="address" 
                  placeholder="123 Main St, Anytown, USA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  This helps personalize your experience (100 chars max)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-zing-600 hover:bg-zing-700" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Setting Up..." : "Continue to Dashboard"}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  updateHome(null);
                  navigate("/dashboard");
                }}
              >
                Skip for now
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
