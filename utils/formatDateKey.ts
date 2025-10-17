export function formatDateKey(date: Date): string {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString(
    "en-AU",
    options as Intl.DateTimeFormatOptions
  );
  return formattedDate;
}
