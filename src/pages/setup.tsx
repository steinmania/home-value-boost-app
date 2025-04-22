
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateHome, addProperty, PROPERTIES, CURRENT_USER } from "@/lib/data";
import { useAddressAutocomplete, AddressSuggestion } from "@/hooks/useAddressAutocomplete";
import { MiniMap } from "@/components/MiniMap";
import { MapPin } from "lucide-react";

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
];

export default function Setup() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("us");
  const [rawInput, setRawInput] = useState("");
  const [propertyName, setPropertyName] = useState("My Home");
  const [selected, setSelected] = useState<AddressSuggestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLUListElement>(null);
  
  const { suggestions, loading, search, clear, error } = useAddressAutocomplete();

  const isPremium = CURRENT_USER.subscription === "Premium";
  const canAddMore = isPremium || PROPERTIES.length === 0;
  
  // Determine if the form is valid and enabled
  const isFormValid = propertyName.trim().length > 0;
  const hasAddressInput = rawInput.trim().length > 0 || selected;

  // Handle clicks outside the suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionRef.current && 
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle address input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRawInput(val);
    
    // Only clear selected if input changes
    if (selected && val !== selected.label) {
      setSelected(null);
    }
    
    if (val.length >= 3) {
      setShowSuggestions(true);
      search(val, country);
    } else {
      clear();
      setShowSuggestions(false);
    }
  };

  // Handle country selection changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setCountry(newCountry);
    
    if (rawInput && rawInput.length >= 3) {
      search(rawInput, newCountry);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (s: AddressSuggestion) => {
    setRawInput(s.label);
    setSelected(s);
    setShowSuggestions(false);
  };

  // Handle property name changes
  const handlePropertyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPropertyName(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!propertyName.trim()) {
      toast.error("Property name is required");
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (PROPERTIES.length === 0) {
        // First property (free tier)
        updateHome(
          selected ? selected.label : rawInput.trim() || null, 
          propertyName.trim()
        );
        
        toast.success("Property added successfully!");
      } else if (isPremium) {
        // Additional property (premium tier)
        const added = addProperty(
          selected ? selected.label : rawInput.trim() || null,
          propertyName.trim()
        );
        
        if (added) {
          toast.success("Additional property added!");
        } else {
          toast.error("Failed to add property");
        }
      } else {
        // Free tier user trying to add more than one property
        toast.error("You need to upgrade to Premium to add more properties");
      }
      
      // Navigate to dashboard after successful submission
      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding property:", error);
      toast.error("Failed to add property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-zing-50 to-white">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo className="mb-2" />
          <h1 className="text-2xl font-bold">Welcome to Zing!</h1>
          <p className="text-muted-foreground text-center mt-1">
            {PROPERTIES.length === 0 
              ? "Let's set up your first property" 
              : "Add another property to your portfolio"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {PROPERTIES.length === 0 ? "Add Your First Property" : "Add Another Property"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit} autoComplete="off">
            <CardContent className="space-y-4">
              {/* Property Name Field */}
              <div className="space-y-2">
                <Label htmlFor="propertyName" className="text-base font-medium">
                  Property Name
                </Label>
                <Input
                  id="propertyName"
                  placeholder="E.g. Lake House, Main Home"
                  value={propertyName}
                  onChange={handlePropertyNameChange}
                  maxLength={40}
                  className="text-base"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Choose a custom name for this property
                </p>
              </div>

              {/* Country Selection */}
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

              {/* Address Field */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-medium">
                  Address <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  {/* Address Input Field */}
                  <div 
                    className={`flex items-center border rounded-md bg-background px-3 transition ${
                      showSuggestions ? "border-zing-500 ring-2 ring-zing-500" : "border-zing-300"
                    }`}
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
                  
                  {/* Address Suggestions Dropdown */}
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
                          {error || "No matches found. Try a different search."}
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
                  Start typing and select your verified address from the list.
                </p>
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
              </div>

              {/* Selected Address Preview */}
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
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-zing-600 hover:bg-zing-700"
                disabled={!isFormValid || isSubmitting || !canAddMore}
              >
                {isSubmitting 
                  ? "Adding..." 
                  : (PROPERTIES.length === 0 
                    ? "Continue to Dashboard" 
                    : "Add Property")}
              </Button>
              
              {/* Premium Upgrade Note */}
              {!canAddMore && (
                <div className="text-sm text-center text-zing-500">
                  Upgrade to Premium to add more properties!
                </div>
              )}

              {/* Skip/Return Button */}
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  if (PROPERTIES.length === 0) {
                    updateHome(null, propertyName.trim());
                  }
                  navigate("/dashboard");
                }}
              >
                {PROPERTIES.length === 0 ? "Skip for now" : "Return to Dashboard"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
