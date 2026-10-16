export interface Fixture {
  id: number;
  kickOffTime: string;
  homeTeam: string;
  awayTeam: string;
  pitchId: number;
  ageGroup: string;
  division: string;
  group: string;
}

export interface GenerateFixturesResponse {
  success: boolean;
  message: string;
  fixtureCount: number;
  fixtures: Fixture[];
}

export interface TeamFixturesResponse {
  teamId: number;
  eventId: number;
  fixtureCount: number;
  fixtures: Fixture[];
}