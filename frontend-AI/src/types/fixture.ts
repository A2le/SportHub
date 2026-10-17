
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

// Returned by GenerateFixtures
export interface GenerateFixturesResponse {
  success: boolean;
  message: string;
  fixtureCount: number;
  fixtures: Fixture[];
}

// Returned by GetTeamFixtures
export interface TeamFixture {
  id: number;
  kickOffTime: string;
  opponent: string;
  isHomeGame: boolean;
  venue: string;
  pitchId: number;
  status: string;
  ageGroup: string;
  division: string;
  group: string;
  details: {
    homeTeam: string;
    awayTeam: string;
  };
}

export interface TeamFixturesResponse {
  teamId: number;
  eventId: number;
  fixtureCount: number;
  fixtures: TeamFixture[];
}
