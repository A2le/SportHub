
import axios from "axios";

export interface EventRegistration {
  id: number;
  eventId: number;
  teamId: number;
  teamName: string;
  ageGroup: string;
  division: string;
  status: string;
  registeredAt: string;
}

const sportsHubApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });

export async function getEventRegistrations(
  eventId: number
): Promise<EventRegistration[]> {
  const response = await sportsHubApi.get<EventRegistration[]>(
    `/Registrations/event/${eventId}`
  );

  return response.data;
}

export async function findTeamByName(
  eventId: number,
  teamName: string
): Promise<EventRegistration[]> {
    console.log(eventId," : ", teamName)
  const registrations = await getEventRegistrations(eventId);

  const normalize = (value: string) =>
    value.trim().replace(/\s+/g, " ").toLowerCase();

  const query = normalize(teamName);

  return registrations.filter(
    (registration) =>
      normalize(registration.teamName) === query
  );
}
