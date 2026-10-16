export interface RegistrationStatusResponse {
  eventId: number;
  eventName: string;
  maxTeams: number;
  registeredTeams: number;
  availableSpots: number;
  registrationOpen: boolean;
}