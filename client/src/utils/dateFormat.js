// Convert ISO datetime to datetime-local input format (YYYY-MM-DDTHH:MM)
export const toDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  // Remove seconds and timezone from ISO string
  return isoString.slice(0, 16);
};

// Convert datetime-local input value to ISO string
export const toISOString = (datetimeLocal) => {
  if (!datetimeLocal) return "";
  return new Date(datetimeLocal).toISOString();
};

// Format ISO datetime for display (e.g., "Jan 15, 2025 at 2:30 PM")
export const formatDateTime = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};

// Format ISO date only (e.g., "Jan 15, 2025")
export const formatDate = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleString("en-US", options);
};

// Format ISO time only (e.g., "2:30 PM")
export const formatTime = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const options = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};

// Get relative time (e.g., "in 3 days", "2 hours ago")
export const getRelativeTime = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();
  const diffMs = date - now;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 7) {
    return formatDate(isoString);
  } else if (diffDay > 1) {
    return `in ${diffDay} days`;
  } else if (diffDay === 1) {
    return "tomorrow";
  } else if (diffDay === -1) {
    return "yesterday";
  } else if (diffDay < -1) {
    return `${Math.abs(diffDay)} days ago`;
  } else if (diffHour > 1) {
    return `in ${diffHour} hours`;
  } else if (diffHour === 1) {
    return "in 1 hour";
  } else if (diffHour < -1) {
    return `${Math.abs(diffHour)} hours ago`;
  } else if (diffMin > 1) {
    return `in ${diffMin} minutes`;
  } else if (diffMin === 1) {
    return "in 1 minute";
  } else if (diffMin < -1) {
    return `${Math.abs(diffMin)} minutes ago`;
  } else {
    return "just now";
  }
};
