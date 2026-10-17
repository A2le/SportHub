import type { TeamFixture } from "./fixture";
import type { AgentEventInfo } from "./agentEvent";
import type {
  RegistrationStatusResponse,
} from "./registrationStatus";

export type ChatRole = "user" | "assistant";

export interface Registration {
  eventId: number;
  teamName: string;
  schoolName: string;
  coachName: string;
  coachPhone: string;
  ageGroup: string;
  division: string;
}

export type RegistrationStatus =
  | "idle"
  | "collecting"
  | "review"
  | "completed"
  | "cancelled";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  registration?: Registration;
  quickReplies?: QuickReply[];
  eventDetails?: AgentEventInfo;
  fixtures?: TeamFixture[];
  registrationStatus?: RegistrationStatusResponse;
}

export interface AgentRequest {
  conversation_id: string;
  event_id: number;
  message: string;
}

export interface AgentResponse {
  conversation_id: string;
  reply: string;
  status: RegistrationStatus;
  registration?: Registration | null;
  quickReplies?: QuickReply[];
}

export interface QuickReply {
  label: string;
  value: string;
}