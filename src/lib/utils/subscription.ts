
import { CURRENT_USER, getFreeLogsRemaining, getFreeRemindersRemaining } from "@/lib/data";

export const isPremium = (): boolean => {
  return CURRENT_USER.subscription === 'Premium';
};

export const canAddLog = (): boolean => {
  return isPremium() || getFreeLogsRemaining() > 0;
};

export const canAddReminder = (): boolean => {
  return isPremium() || getFreeRemindersRemaining() > 0;
};

export const getSubscriptionDetails = () => {
  const isUserPremium = isPremium();
  const logsRemaining = getFreeLogsRemaining();
  const remindersRemaining = getFreeRemindersRemaining();
  
  return {
    type: isUserPremium ? 'Premium' : 'Free',
    logsRemaining: isUserPremium ? 'Unlimited' : logsRemaining,
    remindersRemaining: isUserPremium ? 'Unlimited' : remindersRemaining,
    isLimited: !isUserPremium
  };
};
