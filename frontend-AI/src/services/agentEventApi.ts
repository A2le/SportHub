import axios from "axios";
import type { AgentEventInfo } from "../types/agentEvent";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export async function getAgentEventInfo(
  eventId: number
): Promise<AgentEventInfo> {
  const response = await api.get<AgentEventInfo>(
    `/api/agent-tools/events/${eventId}`
  );

  return response.data;
}