import { getLiveDepartures } from "@/lib/flight-service";
import { HomeClient } from "@/components/home-client";

export default async function Home() {
  const result = await getLiveDepartures("GRU");
  const initialFlights = result.success ? result.data : [];

  return <HomeClient initialFlights={initialFlights} />;
}
