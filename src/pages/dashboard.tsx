
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PROPERTIES, CURRENT_USER, getLogsForProperty, getRemindersForProperty } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, History, Calendar, Home } from "lucide-react";
import { MaintenanceLogItem } from "@/components/MaintenanceLogItem";
import { ReminderItem } from "@/components/ReminderItem";
import { EmptyState } from "@/components/EmptyState";
import { ValueDisplay } from "@/components/ValueDisplay";
import { toast } from "sonner";
import { MiniMap } from "@/components/MiniMap";
import { MiniStreetView } from "@/components/MiniStreetView";

// Helper to fetch lat/lon for an address
const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number } | null> => {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 
        "User-Agent": "zing-home-app",
        "Accept-Language": "en" 
      },
    });
    const data = await res.json();
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("history");
  
  // Properties and selection state
  const properties = PROPERTIES;
  const isPremium = CURRENT_USER.subscription === "Premium";
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id);
  
  // Map locations state
  const [mapLocations, setMapLocations] = useState<{ [propertyId: string]: { lat: number; lon: number } | null }>({});

  // Property being viewed
  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  
  // Title based on number of properties
  const title = isPremium && properties.length > 1 ? "My properties" : "My property";

  // Get logs and reminders for selected property
  const logsForProperty = selectedProperty ? getLogsForProperty(selectedProperty.id) : [];
  const remindersForProperty = selectedProperty ? getRemindersForProperty(selectedProperty.id) : [];

  // Direct to setup if no properties
  const hasNoProperties = properties.length === 0;

  // Load map locations when properties change
  useEffect(() => {
    async function loadLocations() {
      for (const prop of properties) {
        if (prop.address && !mapLocations[prop.id]) {
          const coords = await geocodeAddress(prop.address);
          if (coords) {
            setMapLocations(prev => ({ ...prev, [prop.id]: coords }));
          }
        }
      }
    }
    loadLocations();
  }, [properties]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />

      <div className="container px-4 py-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Home Maintenance Tracker
            </h1>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{title}</span>
            </div>
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

        {/* Property display section */}
        <div className="mb-4">
          {isPremium && properties.length > 1 ? (
            // Multiple properties display (Premium)
            <div>
              <div className="mb-2 font-medium">My Properties:</div>
              <div className="flex flex-wrap gap-3">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-md border border-zing-200 p-3 cursor-pointer shadow transition hover:shadow-md bg-white flex flex-col items-center w-52 ${selectedPropertyId === p.id ? "ring-2 ring-zing-600" : ""}`}
                    onClick={() => setSelectedPropertyId(p.id)}
                  >
                    <MiniStreetView 
                      address={p.address || ""} 
                      width={120}
                      height={80}
                      clickToAdd={!p.address}
                    />
                    <div className="mt-2 text-sm font-semibold text-zing-700">{p.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 text-center">{p.address || "No address set"}</div>
                    {mapLocations[p.id] && (
                      <div className="mt-1 w-full">
                        <MiniMap
                          lat={mapLocations[p.id]?.lat as number}
                          lon={mapLocations[p.id]?.lon as number}
                          label={p.address || ""}
                          height={80}
                          zoom={15}
                        />
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add new property card */}
                {isPremium && (
                  <div
                    className="rounded-md border border-dashed border-zing-300 p-3 cursor-pointer shadow-sm transition hover:shadow-md bg-white flex flex-col items-center justify-center w-52 h-[216px]"
                    onClick={() => navigate("/setup")}
                  >
                    <div className="h-14 w-14 rounded-full bg-zing-50 flex items-center justify-center mb-2">
                      <Plus className="h-8 w-8 text-zing-400" />
                    </div>
                    <div className="text-sm font-semibold text-zing-700">Add New Property</div>
                    <div className="text-xs text-muted-foreground text-center mt-1">Add another property to your portfolio</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Single property view
            <div>
              <div className="mb-2 font-medium">My Property:</div>
              {hasNoProperties ? (
                <div 
                  className="rounded-md border border-dashed border-zing-300 p-4 bg-white flex flex-col items-center justify-center w-72 cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate("/setup")}
                >
                  <MiniStreetView 
                    address="" 
                    width={160}
                    height={100}
                    clickToAdd={true}
                  />
                  <div className="mt-3 text-sm font-semibold text-zing-700">Add Your First Property</div>
                  <div className="text-xs text-muted-foreground text-center mt-1">Click to setup your property details</div>
                </div>
              ) : (
                <div className="rounded-md border border-zing-200 p-3 bg-white flex flex-col items-center w-72">
                  <MiniStreetView 
                    address={selectedProperty?.address || ""} 
                    width={160}
                    height={100}
                    clickToAdd={!selectedProperty?.address}
                  />
                  <div className="mt-2 text-sm font-semibold text-zing-700">{selectedProperty?.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 text-center">{selectedProperty?.address || "No address set"}</div>
                  {selectedProperty?.address && mapLocations[selectedProperty?.id] && (
                    <div className="mt-1 w-full">
                      <MiniMap
                        lat={mapLocations[selectedProperty?.id]?.lat as number}
                        lon={mapLocations[selectedProperty?.id]?.lon as number}
                        label={selectedProperty?.address}
                        height={80}
                        zoom={15}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <ValueDisplay />

        {/* Maintenance section */}
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

        {/* Task history tabs */}
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

          {/* History content */}
          <TabsContent value="history" className="mt-4 space-y-4">
            {hasNoProperties || !selectedProperty || !selectedProperty.id ? (
              <EmptyState
                icon={<History className="h-12 w-12 opacity-50" />}
                title="No maintenance logs yet"
                description="Start tracking your home maintenance to see its impact on your property's value."
                action={
                  <Button
                    className="gap-1 bg-zing-600 hover:bg-zing-700"
                    onClick={() => hasNoProperties ? navigate("/setup") : navigate("/log-task")}
                  >
                    <Plus className="h-4 w-4" />
                    {hasNoProperties ? "Add First Property" : "Log First Task"}
                  </Button>
                }
              />
            ) : (
              logsForProperty.length === 0 ? (
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
                logsForProperty.map(log => (
                  <MaintenanceLogItem
                    key={log.id}
                    log={log}
                    onClick={() => navigate(`/task/${log.id}`)}
                  />
                ))
              )
            )}
          </TabsContent>

          {/* Reminders content */}
          <TabsContent value="reminders" className="mt-4 space-y-4">
            {hasNoProperties || !selectedProperty || !selectedProperty.id ? (
              <EmptyState
                icon={<Calendar className="h-12 w-12 opacity-50" />}
                title="No reminders set"
                description="Create reminders for regular maintenance tasks to keep your home in top condition."
                action={
                  <Button
                    className="gap-1 bg-zing-600 hover:bg-zing-700"
                    onClick={() => hasNoProperties ? navigate("/setup") : navigate("/add-reminder")}
                  >
                    <Plus className="h-4 w-4" />
                    {hasNoProperties ? "Add First Property" : "Add First Reminder"}
                  </Button>
                }
              />
            ) : (
              remindersForProperty.length === 0 ? (
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
                remindersForProperty.map(reminder => (
                  <ReminderItem key={reminder.id} reminder={reminder} />
                ))
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
