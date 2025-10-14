import { RosterManager } from "@/components/RosterManager";
import { getServerDate } from "@/utils/serverDate";

export default function HomePage() {
  // Get current date in a way that's consistent between server and client
  const today = getServerDate();

  return <RosterManager initialDate={today} />;
}
