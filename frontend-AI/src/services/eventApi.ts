import type {
  AgentRequest,
  AgentResponse,
} from "../types/chat";

import { mockAgentReply } from "./mockAgent";

export async function sendAgentMessage(
  request: AgentRequest,
  allowedAgeGroups: string[] = []
): Promise<AgentResponse> {
  return mockAgentReply(request, allowedAgeGroups);
}