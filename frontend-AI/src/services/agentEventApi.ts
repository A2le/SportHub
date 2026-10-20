import axios from "axios";
import type { AgentEventInfo } from "../types/agentEvent";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export interface SportsHubEvent {
  id: number;
  name: string;
  eventType: string;
  venue: string;
  startDate: string;
  ageGroups: string;
  numberOfTeams: number;
  numberOfPitches: number;
}

export async function getSportsHubEvents(): Promise<SportsHubEvent[]> {
  const response = await api.get<SportsHubEvent[]>("/events");
  return response.data;
}
export async function getAgentEvents(): Promise<AgentEventInfo[]> {
  const response = await api.get<AgentEventInfo[]>(
    "/Events"
  );

  return response.data;
}

export async function getAgentEventInfo(
  eventId: number
): Promise<AgentEventInfo> {
  const response = await api.get<AgentEventInfo>(
    `/api/agent-tools/events/${eventId}`
  );

  return response.data;
}