import { api } from "./api";
import type { TeamFixturesResponse } from "../types/fixture";

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