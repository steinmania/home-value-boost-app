
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PROPERTIES, CURRENT_USER, getDefaultProperty, getLogsForProperty, getRemindersForProperty } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, History, Calendar, Home, Map } from "lucide-react";
import { MaintenanceLogItem } from "@/components/MaintenanceLogItem";
import { ReminderItem } from "@/components/ReminderItem";
import { EmptyState } from "@/components/EmptyState";
import { ValueDisplay } from "@/components/ValueDisplay";
import { toast } from "sonner";
import { MiniMap } from "@/components/MiniMap";
import { MiniStreetView } from "@/components/MiniStreetView";

// Helper to fetch lat/lon for the current home address
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data[0]) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("history");
  // Track selected property (for Premium with multiple)
  const properties = PROPERTIES;
  const isPremium = CURRENT_USER.subscription === "Premium";
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id);

  // Property being viewed
  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];

  // Map locations for all properties
  const [mapLocations, setMapLocations] = useState<{ [propertyId: string]: { lat: number; lon: number } | null }>({});
  useMemo(() => {
    async function loadLocations() {
      for (const prop of properties) {
        if (prop.address && !mapLocations[prop.id]) {
          const coords = await geocodeAddress(prop.address);
          setMapLocations(loc => ({ ...loc, [prop.id]: coords }));
        }
      }
    }
    loadLocations();
    // eslint-disable-next-line
  }, [properties.map(p => p.address).join(",")]);

  const title = isPremium && properties.length > 1 ? "My properties" : "My property";

  // Get logs and reminders for selected property
  const logsForProperty = getLogsForProperty(selectedProperty?.id || "");
  const remindersForProperty = getRemindersForProperty(selectedProperty?.id || "");

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

        {/* Show property cards if multiple (Premium), or single card if one */}
        <div className="mb-4">
          {isPremium && properties.length > 1 ? (
            <div>
              <div className="mb-2 font-medium">My Properties:</div>
              <div className="flex flex-wrap gap-3">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-md border border-zing-200 p-3 cursor-pointer shadow transition hover:shadow-md bg-white flex flex-col items-center w-52 ${selectedPropertyId === p.id ? "ring-2 ring-zing-600" : ""}`}
                    onClick={() => setSelectedPropertyId(p.id)}
                  >
                    <MiniStreetView address={p.address || ""} />
                    <div className="mt-2 text-sm font-semibold text-zing-700">{p.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 text-center">{p.address || "No address set"}</div>
                    <div className="mt-1">
                      {mapLocations[p.id] && p.address && (
                        <MiniMap
                          lat={mapLocations[p.id]?.lat as number}
                          lon={mapLocations[p.id]?.lon as number}
                          label={p.address}
                          height={80}
                          zoom={15}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Single property view
            <div>
              <div className="mb-2 font-medium">My Property:</div>
              <div className="rounded-md border border-zing-200 p-3 bg-white flex flex-col items-center w-72">
                <MiniStreetView address={selectedProperty.address || ""} />
                <div className="mt-2 text-sm font-semibold text-zing-700">{selectedProperty.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 text-center">{selectedProperty.address || "No address set"}</div>
                <div className="mt-1">
                  {mapLocations[selectedProperty.id] && selectedProperty.address && (
                    <MiniMap
                      lat={mapLocations[selectedProperty.id]?.lat as number}
                      lon={mapLocations[selectedProperty.id]?.lon as number}
                      label={selectedProperty.address}
                      height={80}
                      zoom={15}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
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
            {(!selectedProperty || !selectedProperty.id) ||
            (PROPERTIES.length === 0) ? (
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
              // Only show logs/reminders for selected property
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
                    onClick={() => toast.info("Task details view coming soon!")}
                  />
                ))
              )
            )}
          </TabsContent>

          <TabsContent value="reminders" className="mt-4 space-y-4">
            {(!selectedProperty || !selectedProperty.id) ||
            (PROPERTIES.length === 0) ? (
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
