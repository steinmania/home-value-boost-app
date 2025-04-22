
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateHome } from "@/lib/data";
import { useAddressAutocomplete, AddressSuggestion } from "@/hooks/useAddressAutocomplete";
import { MiniMap } from "@/components/MiniMap";

export default function Setup() {
  const navigate = useNavigate();
  const [rawInput, setRawInput] = useState("");
  const [selected, setSelected] = useState<AddressSuggestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { suggestions, loading, search, clear } = useAddressAutocomplete();

  // When user types, search for address suggestions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);
    setSelected(null);
    search(val);
  };

  // User picks from suggestions
  const handleSuggestionClick = (s: AddressSuggestion) => {
    setRawInput(s.label);
    setSelected(s);
    clear();
    setTimeout(() => {
      inputRef.current?.blur();
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Only allow verified/selected address
    if (selected) {
      updateHome(selected.label);
    } else if (rawInput.trim().length > 0) {
      toast.error("Please select a verified address from suggestions.");
      setIsSubmitting(false);
      return;
    } else {
      // Allow skipping address
      updateHome(null);
    }

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
          <form onSubmit={handleSubmit} autoComplete="off">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Home Address (Optional)</Label>
                <div className="relative">
                  <Input
                    id="address"
                    ref={inputRef}
                    placeholder="Start typing address"
                    value={rawInput}
                    onChange={handleInputChange}
                    maxLength={100}
                    autoComplete="off"
                  />
                  {/* Suggestions dropdown */}
                  {loading && (
                    <div className="absolute left-0 right-0 bg-white border rounded shadow-sm z-30 mt-1 p-2 text-sm">
                      Loading suggestions...
                    </div>
                  )}
                  {suggestions.length > 0 && (
                    <ul className="absolute left-0 right-0 bg-white border rounded shadow-md z-30 mt-1 max-h-48 overflow-auto">
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          className="p-2 hover:bg-zing-50 cursor-pointer transition"
                          onClick={() => handleSuggestionClick(s)}
                        >
                          {s.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Start typing and select your verified address from the list.
                </p>
              </div>
              {selected && (
                <div>
                  <span className="font-semibold text-sm">Verified:</span>
                  <div className="text-xs text-muted-foreground mb-2">{selected.label}</div>
                  <MiniMap lat={selected.lat} lon={selected.lon} label={selected.label} height={140}/>
                </div>
              )}
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
