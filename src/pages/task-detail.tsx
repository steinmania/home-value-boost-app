
import { useParams } from "react-router-dom";
import { NavBar } from "@/components/NavBar";
import { MAINTENANCE_LOGS } from "@/lib/data";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  
  // Find the log with the matching ID
  const log = MAINTENANCE_LOGS.find(log => log.id === id) || {
    id: "",
    propertyId: "",  // Updated from homeId to propertyId
    taskId: null,
    customTask: "",
    date: "",
    cost: 0,
    photoUrl: null,
    isPreloadedTask: false
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="container px-4 py-6">
        <h1 className="text-2xl font-bold">Task Detail (Coming Soon)</h1>
        <p>Task ID: {id}</p>
        <pre>{JSON.stringify(log, null, 2)}</pre>
      </div>
    </div>
  );
}
