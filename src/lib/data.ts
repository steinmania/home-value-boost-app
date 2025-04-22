// Mock data for development
import { format } from 'date-fns';

// Types definitions
export interface User {
  id: string;
  email: string;
  subscription: 'Free' | 'Premium';
}

export interface Property {
  id: string;
  userId: string;
  address: string | null;
  name: string;
}

export interface Home extends Property {} // For backward compatibility

// Mock data - moved CURRENT_USER before PROPERTIES to fix circular reference
export const CURRENT_USER: User = {
  id: 'user1',
  email: 'demo@example.com',
  subscription: 'Free'
};

// Changed HOME to PROPERTIES for multiple home support
export let PROPERTIES: Property[] = [
  {
    id: "property1",
    userId: CURRENT_USER.id,
    address: null,
    name: "My Home"
  }
];

// Remove HOME variable
// export const HOME: Home = { ... };

// Utility to get the current (primary) property for free users or selected one
export const getDefaultProperty = (): Property => {
  return PROPERTIES[0];
};

export const addProperty = (address: string | null, name: string): Property | null => {
  // Free: only one property; Premium: can add more
  if (CURRENT_USER.subscription !== "Premium" && PROPERTIES.length >= 1) {
    return null;
  }
  const newProperty: Property = {
    id: `property${PROPERTIES.length + 1}`,
    userId: CURRENT_USER.id,
    address,
    name,
  };
  PROPERTIES.push(newProperty);
  return newProperty;
};

// Update address/name for a property by id
export const updateProperty = (id: string, address: string | null, name: string): Property | null => {
  const prop = PROPERTIES.find(p => p.id === id);
  if (!prop) return null;
  prop.address = address;
  prop.name = name;
  return prop;
};

// Remove property (Premium only, do not allow deleting last property)
export const removeProperty = (id: string): boolean => {
  if (PROPERTIES.length === 1) return false;
  const idx = PROPERTIES.findIndex(p => p.id === id);
  if (idx === -1) return false;
  PROPERTIES.splice(idx, 1);
  return true;
};

export interface MaintenanceTask {
  id: string;
  name: string;
  valueMin: number;
  valueMax: number;
  tip: string;
}

export interface MaintenanceLog {
  id: string;
  propertyId: string; // changed field from homeId to propertyId
  taskId: string | null;
  customTask: string | null;
  date: string;
  cost: number | null;
  photoUrl: string | null;
  isPreloadedTask: boolean;
}

export interface Reminder {
  id: string;
  propertyId: string; // changed field from homeId to propertyId
  task: string;
  startDate: string;
  frequency: 'Yearly';
}

// Mock data
export const MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'task1',
    name: 'Replace HVAC Air Filter',
    valueMin: 100,
    valueMax: 200,
    tip: 'For optimal performance, use a high-quality filter rated MERV 11 or higher.'
  },
  {
    id: 'task2',
    name: 'Clean Gutters',
    valueMin: 200,
    valueMax: 500,
    tip: 'Install gutter guards to reduce the frequency of cleaning needed.'
  },
  {
    id: 'task3',
    name: 'Seal Deck',
    valueMin: 500,
    valueMax: 1000,
    tip: 'Apply sealer on a dry day when temperatures are between 50-90°F.'
  },
  {
    id: 'task4',
    name: 'Repaint Exterior',
    valueMin: 2000,
    valueMax: 5000,
    tip: 'Choose quality paint with high UV resistance for longer-lasting results.'
  },
  {
    id: 'task5',
    name: 'Service HVAC System',
    valueMin: 300,
    valueMax: 700,
    tip: 'Regular maintenance can extend your system\'s life by 5+ years.'
  },
  {
    id: 'task6',
    name: 'Fix Plumbing Leak',
    valueMin: 150,
    valueMax: 400,
    tip: 'Check under sinks monthly for early detection of slow leaks.'
  },
  {
    id: 'task7',
    name: 'Replace Water Heater',
    valueMin: 800,
    valueMax: 1500,
    tip: 'Consider a tankless model for better efficiency and longer lifespan.'
  },
  {
    id: 'task8',
    name: 'Update Kitchen Faucet',
    valueMin: 200,
    valueMax: 600,
    tip: 'Look for touchless features for better hygiene and convenience.'
  },
  {
    id: 'task9',
    name: 'Replace Dishwasher',
    valueMin: 500,
    valueMax: 1200,
    tip: 'Energy Star models can save you $35+ per year on utility bills.'
  },
  {
    id: 'task10',
    name: 'Install Smart Thermostat',
    valueMin: 200,
    valueMax: 500,
    tip: 'Can save up to 10-15% on heating and cooling costs annually.'
  }
];

export const MAINTENANCE_LOGS: MaintenanceLog[] = [
  {
    id: 'log1',
    propertyId: 'property1',
    taskId: 'task1',
    customTask: null,
    date: format(new Date(2025, 3, 15), 'yyyy-MM-dd'),
    cost: 25,
    photoUrl: null,
    isPreloadedTask: true
  },
  {
    id: 'log2',
    propertyId: 'property1',
    taskId: 'task2',
    customTask: null,
    date: format(new Date(2025, 2, 20), 'yyyy-MM-dd'),
    cost: 0,
    photoUrl: null,
    isPreloadedTask: true
  }
];

export const REMINDERS: Reminder[] = [
  {
    id: 'reminder1',
    propertyId: 'property1',
    task: 'Replace HVAC Air Filter',
    startDate: format(new Date(2025, 6, 1), 'yyyy-MM-dd'),
    frequency: 'Yearly'
  }
];

// Helper: for compatibility, get logs/reminders by propertyId
export const getLogsForProperty = (propertyId: string) =>
  MAINTENANCE_LOGS.filter((log) => log.propertyId === propertyId);
export const getRemindersForProperty = (propertyId: string) =>
  REMINDERS.filter((r) => r.propertyId === propertyId);

// Utility functions
export const getTaskById = (id: string): MaintenanceTask | undefined => {
  return MAINTENANCE_TASKS.find(task => task.id === id);
};

export const getTaskValueText = (taskId: string | null): string => {
  if (!taskId) return '';
  const task = getTaskById(taskId);
  if (!task) return '';
  
  return `$${task.valueMin.toLocaleString()}-$${task.valueMax.toLocaleString()}`;
};

export const calculateTotalValue = (): { min: number, max: number } => {
  const values = MAINTENANCE_LOGS
    .filter(log => log.isPreloadedTask && log.taskId)
    .map(log => {
      const task = getTaskById(log.taskId as string);
      return task ? { min: task.valueMin, max: task.valueMax } : { min: 0, max: 0 };
    });

  return values.reduce(
    (acc, value) => ({ min: acc.min + value.min, max: acc.max + value.max }),
    { min: 0, max: 0 }
  );
};

export const upgradeToPremuim = () => {
  CURRENT_USER.subscription = 'Premium';
};

export const getMilestoneProgress = (totalValue: { min: number, max: number }): number => {
  // Using average of min and max for progress calculation
  const average = (totalValue.min + totalValue.max) / 2;
  // 10K is the milestone
  return Math.min(Math.floor((average / 10000) * 100), 100);
};

export const addLog = (log: Omit<MaintenanceLog, 'id'>): MaintenanceLog => {
  const newLog = {
    ...log,
    id: `log${MAINTENANCE_LOGS.length + 1}`
  };
  MAINTENANCE_LOGS.push(newLog);
  return newLog;
};
export const addReminder = (reminder: Omit<Reminder, 'id'>): Reminder => {
  const newReminder = {
    ...reminder,
    id: `reminder${REMINDERS.length + 1}`
  };
  REMINDERS.push(newReminder);
  return newReminder;
};

// "Update home" now sets the primary property (property1)
export const updateHome = (address: string | null, name: string = "My Home"): Property => {
  PROPERTIES[0].address = address;
  PROPERTIES[0].name = name;
  return PROPERTIES[0];
};

export const getFreeLogsRemaining = (): number => {
  if (CURRENT_USER.subscription === 'Premium') return Infinity;
  
  const logsUsed = MAINTENANCE_LOGS.length;
  return Math.max(0, 3 - logsUsed);
};

export const getFreeRemindersRemaining = (): number => {
  if (CURRENT_USER.subscription === 'Premium') return Infinity;
  
  const remindersUsed = REMINDERS.length;
  return Math.max(0, 1 - remindersUsed);
};
