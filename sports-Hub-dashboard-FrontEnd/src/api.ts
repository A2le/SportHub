const BASE = '/api/events';

export interface EventResponse {
  id: number;
  name: string;
  eventType: string;
  sportCategory: string;
  venue: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  numberOfTeams: number;
  description: string;
  ageGroups: string;
  pitchStartTime: string;
  pitchEndTime: string;
  matchDurationMinutes: number;
  breakBetweenMatchesMinutes: number;
  maxMatchesPerTeam: number;
  minRestTimeBetweenMatches: number;
  createdAt: string;
}

export interface CreateEventRequest {
  name: string;
  venue: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  numberOfTeams: number;
  pitchStartTime: string;
  pitchEndTime: string;
  description?: string;
  ageGroups?: string;
  eventType?: string;
  sportCategory?: string;
  matchDurationMinutes?: number;
  breakBetweenMatchesMinutes?: number;
  maxMatchesPerTeam?: number;
  minRestTimeBetweenMatches?: number;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

export interface TeamResponse {
  id: number;
  name: string;
  schoolName: string;
  coachName: string;
  coachPhone: string;
  ageGroup: string;
  createdAt: string;
}

export interface CreateTeamRequest {
  name: string;
  schoolName: string;
  coachName: string;
  coachPhone: string;
  ageGroup: string;
}

export const teamsApi = {
  list: () => request<TeamResponse[]>('/api/teams'),
  create: (data: CreateTeamRequest) =>
    request<TeamResponse>('/api/teams', { method: 'POST', body: JSON.stringify(data) }),
};

export interface FixtureResponse {
  id: number;
  eventId: number;
  homeTeamId: number;
  awayTeamId: number;
  pitchId: number;
  scheduledAt: string;
  status: string;
}

export interface RegistrationResponse {
  id: number;
  eventId: number;
  teamId: number;
  teamName: string;
  ageGroup: string;
  division: string;
  status: string;
  registeredAt: string;
}

export const registrationsApi = {
  getByEvent: (eventId: number) =>
    request<RegistrationResponse[]>(`/api/registrations/event/${eventId}`),
};

export const fixturesApi = {
  getByEvent: (eventId: number) => request<FixtureResponse[]>(`/api/fixtures/${eventId}`),
  generate: (eventId: number, pitchId: number, startDate: string) =>
    request<FixtureResponse[]>('/api/fixtures/generate', {
      method: 'POST',
      body: JSON.stringify({ eventId, pitchId, startDate }),
    }),
};

export const eventsApi = {
  list: () => request<EventResponse[]>(BASE),
  get: (id: number) => request<EventResponse>(`${BASE}/${id}`),
  create: (data: CreateEventRequest) =>
    request<EventResponse>(BASE, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CreateEventRequest>) =>
    request<EventResponse>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => fetch(`${BASE}/${id}`, { method: 'DELETE' }),
};
