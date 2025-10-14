export function getServerDate() {
  const now = new Date();

  // Create formatters for each date component in Melbourne timezone
  const melbourneFormatters = {
    year: new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Melbourne",
      year: "numeric",
    }),
    month: new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Melbourne",
      month: "numeric",
    }),
    day: new Intl.DateTimeFormat("en-AU", {
      timeZone: "Australia/Melbourne",
      day: "numeric",
    }),
  };

  // Get date components in Melbourne timezone
  const year = parseInt(melbourneFormatters.year.format(now));
  const month = parseInt(melbourneFormatters.month.format(now)) - 1; // Months are 0-based in Date
  const date = parseInt(melbourneFormatters.day.format(now));

  // Create a new date using Melbourne timezone components
  // This ensures consistent date representation between server and client
  return new Date(year, month, date);
}
