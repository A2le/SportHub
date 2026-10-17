import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import axios from "axios";

import type { AgentEventInfo } from "../types/agentEvent";
import type {
  ChatMessage as Message,
  QuickReply,
  Registration,
  RegistrationStatus,
} from "../types/chat";
//import RegistrationStatusCard from "../components/RegistrationStatusCard";
import { getAgentEventInfo } from "../services/agentEventApi";
import { registerTeam } from "../services/registrationApi";
import { sendAgentMessage } from "../services/eventApi";

//import EventDetailsCard from "../components/EventDetailsCard";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import RegistrationActions from "../components/RegistrationActions";
import type { RegistrationStatusResponse } from "../types/registrationStatus";
import {
  checkCanRegister,
  getRegistrationStatus,
} from "../services/registrationApi";

import { readCanRegister } from "../utils/registration";
//import TeamFixtureLookup from "../components/TeamFixtureLookup";
import { resetMockConversation } from "../services/mockAgent";
import { Avatar, Stack, Chip /* Skeleton */ } from "@mui/material";

import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import SportsHubHeader from "../components/SportsHubHeader";
import { C } from "../theme/sportsHubTheme";
//import RegistrationStatusCard from "../components/RegistrationStatusCard";
//import EventDetailsCard from "../components/EventDetailsCard";
//import TeamFixtureLookup from "../components/TeamFixtureLookup";

import { getTeamFixtures } from "../services/fixtureApi";
//import { getAgentEventInfo } from "../services/agentEventApi";
//import type { Fixture } from "../types/fixture";
//import type { QuickReply } from "../types/chat";
import type { TeamFixture } from "../types/fixture";
import WhatsAppRegistrationButton from "../components/WhatsAppRegistrationButton";

const EVENT_ID = Number(import.meta.env.VITE_EVENT_ID ?? 1);
const MAIN_MENU: QuickReply[] = [
  { label: "Register Team", value: "register" },
  { label: "Event Info", value: "event info" },
  { label: "Check Fixtures", value: "fixtures" },
  {
    label: "Registration Status",
    value: "registration status",
  },
];

function makeMessage(
  role: "user" | "assistant",
  content: string,
  registration?: Registration,
  quickReplies?: QuickReply[],
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString(),
    registration,
    quickReplies,
  };
}

export default function CoachChatPage() {
  const [event, setEvent] = useState<AgentEventInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingFixtureTeamId, setAwaitingFixtureTeamId] = useState(false);
  const [status, setStatus] = useState<RegistrationStatus>("idle");

  const [draft, setDraft] = useState<Registration | null>(null);

  const [conversationId] = useState(() => crypto.randomUUID());
  //const [registrationRefreshKey, setRegistrationRefreshKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  const busy = loading || saving;

  const ageGroups =
    event?.ageGroups
      ?.split(",")
      .map((age) => age.trim().toUpperCase().replace(/\s/g, ""))
      .filter(Boolean) ?? [];

  useEffect(() => {
    let active = true;

    getAgentEventInfo(EVENT_ID)
      .then((data) => {
        if (!active) return;

        setEvent(data);
        setMessages([
          makeMessage(
            "assistant",
            `Hi! Welcome to ${data.name}. How can I help you today?`,
            undefined,
            MAIN_MENU,
          ),
        ]);
      })
      .catch((error: unknown) => {
        if (!active) return;

        console.error("Failed to load event:", error);

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (!error.response) {
            setError(
              "Cannot connect to the backend. Check your API URL, server and CORS settings.",
            );
          } else if (status === 404) {
            setError(
              `Event ${EVENT_ID} was not found, or the API route is incorrect.`,
            );
          } else if (status === 401 || status === 403) {
            setError("You are not authorised to retrieve this event.");
          } else {
            setError(`Unable to load event. Server returned ${status}.`);
          }
        } else {
          setError("An unexpected error occurred while loading the event.");
        }
      })
      .finally(() => {
        if (active) setEventLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages, status]);

  const addAssistantMessage = (
    content: string,
    extras?: {
      eventDetails?: AgentEventInfo;
      fixtures?: TeamFixture[];
      quickReplies?: QuickReply[];
      registrationStatus?: RegistrationStatusResponse;
    },
  ) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        ...extras,
      },
    ]);
  };

  const handleSend = async (text: string) => {
    if (!event || busy) return;

    setLoading(true);
    setError(null);

    setMessages((prev) => [...prev, makeMessage("user", text)]);

    try {
      const input = text.trim().toLowerCase();
      if (
        input === "registration status" ||
        input === "check registration status" ||
        input === "available spots" ||
        input === "how many spaces are available"
      ) {
        try {
          const data = await getRegistrationStatus(event!.id);

          addAssistantMessage("Here's the latest registration availability:", {
            registrationStatus: data,
            quickReplies: MAIN_MENU,
          });
        } catch {
          addAssistantMessage(
            "I couldn't retrieve registration availability right now. Please try again.",
            { quickReplies: MAIN_MENU },
          );
        }

        return;
      }
      if (awaitingFixtureTeamId) {
        if (input === "cancel") {
          setAwaitingFixtureTeamId(false);

          addAssistantMessage("No problem! What would you like to do next?", {
            quickReplies: MAIN_MENU,
          });

          return;
        }

        const teamId = Number(input);

        if (!Number.isSafeInteger(teamId) || teamId <= 0) {
          addAssistantMessage("Please enter a valid numeric team ID.", {
            quickReplies: [{ label: "Cancel", value: "cancel" }],
          });

          return;
        }

        try {
          const result = await getTeamFixtures(teamId, event!.id);

          setAwaitingFixtureTeamId(false);

          if (result.fixtures.length === 0) {
            addAssistantMessage(
              "I couldn't find fixtures for this team yet. They may not have been generated.",
              { quickReplies: MAIN_MENU },
            );
          } else {
            addAssistantMessage(
              `I found ${result.fixtureCount} fixtures for your team.`,
              {
                fixtures: result.fixtures,
                quickReplies: MAIN_MENU,
              },
            );
          }
        } catch {
          addAssistantMessage(
            "I couldn't retrieve those fixtures. Please check the team ID and try again.",
            {
              quickReplies: [{ label: "Cancel", value: "cancel" }],
            },
          );
        }

        return;
      }

      if (
        status === "idle" ||
        status === "completed" ||
        status === "cancelled"
      ) {
        if (input === "event info") {
          try {
            const details = await getAgentEventInfo(event!.id);

            addAssistantMessage("Here are the details for your event:", {
              eventDetails: details,
              quickReplies: MAIN_MENU,
            });
          } catch {
            addAssistantMessage(
              "I couldn't retrieve the event information right now.",
              { quickReplies: MAIN_MENU },
            );
          }

          return;
        }

        if (input === "fixtures" || input === "check fixtures") {
          setAwaitingFixtureTeamId(true);

          addAssistantMessage(
            "Sure! What is your team ID? You can also type cancel.",
          );

          return;
        }
      }
      const response = await sendAgentMessage(
        {
          conversation_id: conversationId,
          event_id: event.id,
          message: text,
        },
        ageGroups,
      );

      setStatus(response.status);

      if (response.status === "review") {
        setDraft(response.registration ?? null);
      }

      if (response.status === "cancelled") {
        setDraft(null);
      }

      setMessages((prev) => [
        ...prev,
        makeMessage(
          "assistant",
          response.reply,
          response.registration ?? undefined,
          response.quickReplies,
        ),
      ]);
    } catch {
      setError("Unable to process your message.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!event || !draft || busy) return;

    setSaving(true);
    setError(null);

    try {
      // Real backend request
      const availability = await checkCanRegister(event.id);

      if (!readCanRegister(availability)) {
        setError("Registration is currently unavailable for this event.");
        return;
      }

      await registerTeam({
        eventId: event.id,
        teamName: draft.teamName,
        schoolName: draft.schoolName,
        coachName: draft.coachName,
        coachPhone: draft.coachPhone,
        ageGroup: draft.ageGroup,
        division: draft.division,
      });

      setStatus("completed");
      setDraft(null);
      //setRegistrationRefreshKey((prev) => prev + 1);
      const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

      /* setMessages((prev) => [
        ...prev,
        makeMessage(
          "assistant",
          isDemoMode
            ? `Demo registration completed for ${draft.teamName}. No data was saved to the database.`
            : `Registration request submitted for ${draft.teamName}. Please check its status with the organiser.`,
        ),
      ]); */
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: isDemoMode
            ? `Demo registration completed for ${draft.teamName}. No data was saved to the database.`
            : "Your registration request has been submitted successfully. You can now check fixtures or register another team.",
          timestamp: new Date().toISOString(),
          quickReplies: MAIN_MENU,
        },
      ]);
      resetMockConversation(conversationId);
    } catch (err: unknown) {
      let message = "Unable to register the team.";

      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (typeof detail === "string") {
          message = detail;
        } else if (!err.response) {
          message =
            "Could not contact the server. Please check the connection before retrying.";
        }
      }

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (busy) return;
    await handleSend("cancel");
  };

  return (
    <Box
      sx={{
        height: "100dvh",
        minHeight: 480,
        bgcolor: C.background,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SportsHubHeader />

      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          pt: { xs: 1, md: 3 },
          pb: { xs: 0, md: 3 },
          px: { xs: 0, sm: 2 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: { xs: 0, sm: 3 },
            border: {
              xs: "none",
              sm: `1px solid ${C.border}`,
            },
          }}
        >
          
{/* Chat header */}
<Box
  sx={{
    px: { xs: 2, sm: 3 },
    py: 2,
    bgcolor: C.white,
    borderBottom: `1px solid ${C.border}`,
  }}
>
  <Stack spacing={2}>
    {/* Assistant information */}
    <Stack
      direction="row"
      spacing={1.5}
      sx={{alignItems:"center"}}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          bgcolor: C.greenLight,
          color: C.green,
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <SmartToyOutlinedIcon />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontWeight: 800,
            color: C.navy,
          }}
        >
          Amusema AI Assistant
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          noWrap
          sx={{ display: "block" }}
        >
          {event
            ? `${event.name} • ${event.venue}`
            : "Football event registration assistant"}
        </Typography>
      </Box>

      <Chip
        label="Web Chat"
        size="small"
        sx={{
          bgcolor: C.greenLight,
          color: C.green,
          fontWeight: 700,
          display: { xs: "none", sm: "flex" },
        }}
      />
    </Stack>

    {/* WhatsApp channel */}
    {event && (
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "stretch", sm: "flex-end" },
          "& .MuiButton-root": {
            width: { xs: "100%", sm: "auto" },
          },
        }}
      >
        <WhatsAppRegistrationButton event={event} />
      </Box>
    )}
  </Stack>
</Box>


          {/* Scrollable conversation */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: { xs: 2, sm: 3 },
              py: 3,
              bgcolor: C.background,
            }}
          >
            {eventLoading && (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Welcome section */}
            {event && (
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Avatar
                  sx={{
                    bgcolor: C.greenLight,
                    color: C.green,
                    width: 56,
                    height: 56,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <SmartToyOutlinedIcon fontSize="large" />
                </Avatar>

                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Welcome to SportsHub AI
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Your football event registration and fixtures assistant.
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  {event.name} • {event.ageGroups}
                </Typography>
              </Box>
            )}

            {/* Conversation messages */}
            {messages.map((message, index) => {
              const isLatest = index === messages.length - 1;

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onQuickReply={
                    isLatest && !busy && status !== "review"
                      ? (value) => void handleSend(value)
                      : undefined
                  }
                  quickRepliesDisabled={
                    !isLatest || busy || status === "review"
                  }
                />
              );
            })}

            {/* Typing indicator */}
            {loading && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mb: 2, alignItems: "center" }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: C.greenLight,
                    color: C.green,
                  }}
                >
                  <SmartToyOutlinedIcon fontSize="small" />
                </Avatar>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    color: C.muted,
                  }}
                >
                  <Typography variant="body2">
                    Amusema AI is typing...
                  </Typography>
                </Paper>
              </Stack>
            )}

            {/* Registration confirmation */}
            {status === "review" && draft && (
              <RegistrationActions
                onConfirm={() => void handleConfirm()}
                onCancel={() => void handleCancel()}
                disabled={busy}
              />
            )}

            {/* Saving state */}
            {saving && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ p: 2, alignItems: "center" }}
              >
                <CircularProgress size={18} />
                <Typography variant="body2">
                  Submitting registration...
                </Typography>
              </Stack>
            )}

            <div ref={bottomRef} />
          </Box>

          {/* Message input */}
          <ChatInput
            onSend={handleSend}
            disabled={!event || busy || status === "review"}
          />

          <Typography
            variant="caption"
            sx={{
              textAlign: "center",
              pb: 1.5,
              bgcolor: C.white,
              color: C.muted,
            }}
          >
            Powered by Amusema Sports AI
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
