
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
  const registrations = await getEventRegistrations(eventId);

  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const query = normalize(teamName);

  if (!query) return [];

  // Only consider confirmed registrations
  const confirmedTeams = registrations.filter(
    (registration) =>
      registration.status.toLowerCase() === "confirmed"
  );

  // First, check for an exact match
  const exactMatches = confirmedTeams.filter(
    (registration) =>
      normalize(registration.teamName) === query
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  // Otherwise, allow partial matches
  return confirmedTeams.filter((registration) =>
    normalize(registration.teamName).includes(query)
  );
}

