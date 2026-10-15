import type {
  AgentRequest,
  AgentResponse,
  Registration,
  RegistrationStatus,
} from "../types/chat";

type Step =
  | "idle"
  | "team"
  | "school"
  | "coach"
  | "phone"
  | "age"
  | "division"
  | "review";

interface ConversationState {
  step: Step;
  registration: Partial<Registration>;
}

const conversations = new Map<string, ConversationState>();

function reply(
  id: string,
  text: string,
  status: RegistrationStatus,
  registration?: Registration,
): AgentResponse {
  return {
    conversation_id: id,
    reply: text,
    status,
    registration: registration ?? null,
  };
}

export async function mockAgentReply(
  request: AgentRequest,
  allowedAgeGroups: string[] = [],
): Promise<AgentResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const id = request.conversation_id;
  const message = request.message.trim();
  const lower = message.toLowerCase();

  let state = conversations.get(id);

  if (!state) {
    state = {
      step: "idle",
      registration: {},
    };
    conversations.set(id, state);
  }

  if (lower === "cancel") {
    conversations.delete(id);
    return reply(id, "Registration cancelled.", "cancelled");
  }

  switch (state.step) {
    case "idle":
      if (!lower.includes("register")) {
        return reply(
          id,
          "I can help you register a team. Type 'register' to start.",
          "idle",
        );
      }

      state.registration = { eventId: request.event_id };
      state.step = "team";

      return reply(
        id,
        "Let's register your team. What is the team name?",
        "collecting",
      );

    case "team":
      if (message.length < 2) {
        return reply(id, "Enter a valid team name.", "collecting");
      }

      state.registration.teamName = message;
      state.step = "school";

      return reply(id, "Which school does your team represent?", "collecting");

    case "school":
      if (message.length < 2) {
        return reply(id, "Enter a valid school name.", "collecting");
      }

      state.registration.schoolName = message;
      state.step = "coach";

      return reply(id, "What is the coach's full name?", "collecting");

    case "coach":
      if (message.length < 2) {
        return reply(id, "Enter a valid coach name.", "collecting");
      }

      state.registration.coachName = message;
      state.step = "phone";

      return reply(
        id,
        "What is the coach's phone number? Include the country code.",
        "collecting",
      );

    case "phone": {
      const phone = message.replace(/[\s()-]/g, "");

      if (!/^\+?[1-9]\d{7,14}$/.test(phone)) {
        return reply(
          id,
          "Enter a valid international phone number, for example +27821234567.",
          "collecting",
        );
      }

      state.registration.coachPhone = phone;
      state.step = "age";

      return reply(
        id,
        `Which age group? ${
          allowedAgeGroups.length
            ? allowedAgeGroups.join(", ")
            : "Please specify the event's age group"
        }`,
        "collecting",
      );
    }

    case "age": {
      const ageGroup = message.toUpperCase().replace(/\s/g, "");

      if (allowedAgeGroups.length > 0 && !allowedAgeGroups.includes(ageGroup)) {
        return reply(
          id,
          `Choose one of: ${allowedAgeGroups.join(", ")}`,
          "collecting",
        );
      }

      if (!ageGroup) {
        return reply(id, "Enter an age group.", "collecting");
      }

      state.registration.ageGroup = ageGroup;
      state.step = "division";

      return reply(
        id,
        "Which division is your team registering for? Boys or Girls?",
        "collecting",
      );
    }

    case "division": {
      const division = message.toLowerCase();

      if (!["boys", "girls"].includes(division)) {
        return reply(
          id,
          "Please select a valid division: Boys or Girls.",
          "collecting",
        );
      }

      state.registration.division = division === "boys" ? "Boys" : "Girls";

      state.step = "review";

      return reply(
        id,
        "Please review your team registration details before confirming.",
        "review",
        state.registration as Registration,
      );
    }
    case "review":
      return reply(
        id,
        "Use the Confirm Registration or Cancel button.",
        "review",
        state.registration as Registration,
      );
  }
}

export function resetMockConversation(conversationId: string): void {
  conversations.delete(conversationId);
}