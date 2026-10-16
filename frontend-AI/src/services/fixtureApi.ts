import { api } from "./api";
import type { TeamFixturesResponse, GenerateFixturesResponse } from "../types/fixture";

export async function getTeamFixtures(
  teamId: number,
  eventId: number
): Promise<TeamFixturesResponse> {
  const response = await api.get<TeamFixturesResponse>(
    `/api/agent-tools/teams/${teamId}/fixtures`,
    {
      params: { eventId },
    }
  );

  return response.data;
}

export async function generateFixtures(
  eventId: number,
  pitchId: number = 1
): Promise<GenerateFixturesResponse> {
  const response = await api.post<GenerateFixturesResponse>(
    `/api/agent-tools/events/${eventId}/generate-fixtures`,
    { pitchId }
  );

  return response.data;
}