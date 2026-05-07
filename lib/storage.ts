export const getBookings = () => {
  return JSON.parse(localStorage.getItem("bookings") || "[]");
};

export const getBlockedDates = () => {
  return JSON.parse(localStorage.getItem("blockedDates") || "[]");
};

export const saveBlockedDates = (dates: string[]) => {
  localStorage.setItem("blockedDates", JSON.stringify(dates));
};