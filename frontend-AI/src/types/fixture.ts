export interface Fixture {
  id: number;
  eventId: number;
  homeTeam: string;
  awayTeam: string;
  pitchName: string;
  startTime: string;
  endTime?: string;
  status?: string;
}

export interface TeamFixturesResponse {
  teamId: number;
  eventId: number;
  fixtureCount: number;
  fixtures: unknown[];
}