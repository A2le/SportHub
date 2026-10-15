import { api } from "./api";
import type { Registration } from "../types/chat";

export async function checkCanRegister(eventId: number) {
  const response = await api.get(
    `/api/agent-tools/events/${eventId}/can-register`
  );
  return response.data;
}

export async function getRegistrationStatus(eventId: number) {
  const response = await api.get(
    `/api/agent-tools/events/${eventId}/registration-status`
  );
  return response.data;
}

export async function registerTeam2(data: Registration) {
  const response = await api.post(
    "/api/agent-tools/register-team",
    data
  );
  return response.data;
}

export async function registerTeam(data: Registration) {
  if (import.meta.env.VITE_DEMO_MODE === "true") {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      id: 101,
      eventId: data.eventId,
      teamName: data.teamName,
      status: "demo",
    };
  }

  const response = await api.post(
    "/api/agent-tools/register-team",
    data
  );

  return response.data;
}