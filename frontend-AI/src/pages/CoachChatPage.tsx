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
  Registration,
  RegistrationStatus,
} from "../types/chat";
import RegistrationStatusCard from "../components/RegistrationStatusCard";
import { getAgentEventInfo } from "../services/agentEventApi";
import { registerTeam } from "../services/registrationApi";
import { sendAgentMessage } from "../services/eventApi";

import EventDetailsCard from "../components/EventDetailsCard";
import ChatMessage from "../components/ChatMessage";
import ChatInput from "../components/ChatInput";
import RegistrationActions from "../components/RegistrationActions";

import {
  checkCanRegister,
  // getRegistrationStatus,
} from "../services/registrationApi";

import { readCanRegister } from "../utils/registration";
import TeamFixtureLookup from "../components/TeamFixtureLookup";
import { resetMockConversation } from "../services/mockAgent";

const EVENT_ID = Number(import.meta.env.VITE_EVENT_ID ?? 1);

function makeMessage(
  role: "user" | "assistant",
  content: string,
  registration?: Registration,
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: new Date().toISOString(),
    registration,
  };
}

export default function CoachChatPage() {
  const [event, setEvent] = useState<AgentEventInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventLoading, setEventLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<RegistrationStatus>("idle");

  const [draft, setDraft] = useState<Registration | null>(null);

  const [conversationId] = useState(() => crypto.randomUUID());

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
            `Welcome to ${data.name}! Type "register" to register your team.`,
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

  const handleSend = async (text: string) => {
    if (!event || busy) return;

    setLoading(true);
    setError(null);

    setMessages((prev) => [...prev, makeMessage("user", text)]);

    try {
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

      const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

      setMessages((prev) => [
        ...prev,
        makeMessage(
          "assistant",
          isDemoMode
            ? `Demo registration completed for ${draft.teamName}. No data was saved to the database.`
            : `Registration request submitted for ${draft.teamName}. Please check its status with the organiser.`,
        ),
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
        minHeight: "100vh",
        bgcolor: "#f5f7fb",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Amusema Sports AI
        </Typography>

        {eventLoading && <CircularProgress />}

        {event && (
          <>
            <EventDetailsCard event={event} />

            <Box sx={{ mb: 3 }}>
              <RegistrationStatusCard eventId={event.id} />
            </Box>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper
          sx={{
            height: 600,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
            <Typography sx={{ fontWeight: 700 }}>AI Coach Assistant</Typography>
            <Typography variant="caption" color="text.secondary">
              Web registration assistant — guided demo
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 2,
            }}
          >
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {loading && (
              <Typography color="text.secondary">
                Assistant is typing...
              </Typography>
            )}

            {status === "review" && draft && (
              <RegistrationActions
                onConfirm={() => void handleConfirm()}
                onCancel={() => void handleCancel()}
                disabled={busy}
              />
            )}

            {saving && (
              <Box sx={{ display: "flex", gap: 2, p: 2 }}>
                <CircularProgress size={20} />
                <Typography>Submitting registration...</Typography>
              </Box>
            )}

            <div ref={bottomRef} />
          </Box>

          <ChatInput
            onSend={handleSend}
            disabled={busy || !event || status === "review"}
          />
        </Paper>

        {event && (
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ borderRadius: 3 }}>
              <TeamFixtureLookup eventId={event.id} />
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}
