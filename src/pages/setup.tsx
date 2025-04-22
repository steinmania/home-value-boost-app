
import { useState, useRef, useEffect } from "react";
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
import { MapPin, SearchIcon } from "lucide-react";

const COUNTRIES = [
  { code: "us", name: "United States" },
  { code: "ca", name: "Canada" },
  { code: "gb", name: "United Kingdom" },
  { code: "au", name: "Australia" },
  { code: "fr", name: "France" },
  { code: "de", name: "Germany" },
  { code: "it", name: "Italy" },
  { code: "es", name: "Spain" },
  { code: "in", name: "India" },
  // You can add more countries as needed
];

export default function Setup() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("us");
  const [rawInput, setRawInput] = useState("");
  const [selected, setSelected] = useState<AddressSuggestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLUListElement>(null);
  const { suggestions, loading, search, clear } = useAddressAutocomplete();

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current && 
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update address search as user types, restricted to selected country
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);
    setSelected(null);
    setShowSuggestions(true);
    search(val, country);
  };

  // If country changes, re-trigger search if input is long enough
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    // Reset selection and re-trigger search if necessary
    setSelected(null);
    if (rawInput && rawInput.length >= 3) {
      search(rawInput, newCountry);
    }
  };

  // When a user picks a suggestion
  const handleSuggestionClick = (s: AddressSuggestion) => {
    setRawInput(s.label);
    setSelected(s);
    setShowSuggestions(false);
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
              {/* Country select */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-base font-medium">
                  Country
                </Label>
                <select
                  id="country"
                  className="block w-full rounded border border-zing-200 bg-background p-2 text-base focus-visible:ring-2 focus-visible:ring-zing-600 focus-visible:ring-offset-2"
                  value={country}
                  onChange={handleCountryChange}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Address field styled like Stripe */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-medium">
                  Address <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <div 
                    className={`flex items-center border rounded-md bg-background px-3 transition ${
                      showSuggestions ? "border-zing-500 ring-2 ring-zing-500" : "border-zing-300"
                    }`}
                    onClick={() => {
                      inputRef.current?.focus();
                      if (rawInput.length >= 3) {
                        setShowSuggestions(true);
                      }
                    }}
                  >
                    {loading ? (
                      <div className="h-5 w-5 rounded-full border-2 border-zing-500 border-t-transparent animate-spin mr-2" />
                    ) : (
                      <MapPin className="h-5 w-5 text-zing-400 mr-2 flex-shrink-0" aria-hidden />
                    )}
                    <Input
                      id="address"
                      ref={inputRef}
                      placeholder="Start typing address"
                      value={rawInput}
                      onChange={handleInputChange}
                      onFocus={() => {
                        if (rawInput.length >= 3) {
                          setShowSuggestions(true);
                        }
                      }}
                      maxLength={100}
                      autoComplete="off"
                      className="border-0 outline-none shadow-none px-0 py-2 text-base bg-transparent focus-visible:ring-0" 
                      style={{ boxShadow: "none" }}
                    />
                  </div>
                  {/* Suggestions dropdown */}
                  {showSuggestions && (
                    <ul 
                      ref={suggestionRef}
                      className="absolute left-0 right-0 bg-white border rounded-md shadow-md z-30 mt-1 max-h-48 overflow-auto"
                    >
                      {loading && suggestions.length === 0 && (
                        <li className="p-3 text-sm text-muted-foreground">
                          Searching...
                        </li>
                      )}
                      {!loading && suggestions.length === 0 && rawInput.length >= 3 && (
                        <li className="p-3 text-sm text-muted-foreground">
                          No matches found. Try a different search.
                        </li>
                      )}
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          className="p-3 hover:bg-zing-50 cursor-pointer transition border-b last:border-0 text-sm"
                          onClick={() => handleSuggestionClick(s)}
                        >
                          {s.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Start typing and select your verified address from the list. Suggestions are limited to your country.
                </p>
              </div>
              {selected && (
                <div className="mt-2">
                  <div className="bg-zing-50 p-2 rounded-md border border-zing-100">
                    <span className="font-medium text-sm text-zing-700">Verified Address:</span>
                    <div className="text-xs text-muted-foreground mb-2">{selected.label}</div>
                    <MiniMap lat={selected.lat} lon={selected.lon} label={selected.label} height={140} />
                  </div>
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
