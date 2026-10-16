import {
  Avatar,
  Box,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";

import type { ChatMessage as Message } from "../types/chat";
import RegistrationSummary from "./RegistrationSummary";
import QuickReplyOptions from "./QuickReplyOptions";
interface Props {
  message: Message;
  onQuickReply?: (value: string) => void;
  quickRepliesDisabled?: boolean;
}

export default function ChatMessage({
  message,
  onQuickReply,
  quickRepliesDisabled = false,
}: Props) {
  const isUser = message.role === "user";

  const isSuccess =
    !isUser &&
    /registration (completed|successful)|registered successfully/i.test(
      message.content
    );

  const formattedTime = new Date(
    message.timestamp
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        gap: 1.5,
        mb: 2.5,
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            bgcolor: "#E6F4ED",
            color: "#176B54",
            width: 34,
            height: 34,
          }}
        >
          <SmartToyOutlinedIcon fontSize="small" />
        </Avatar>
      )}

      <Box sx={{ maxWidth: { xs: "85%", md: "76%" }, minWidth: 0 }}>
        {!isUser && (
          <Typography
            variant="caption"
            sx={{
              color: "#176B54",
              fontWeight: 700,
              display: "block",
              mb: 0.5,
              ml: 1,
            }}
          >
            Amusema AI
          </Typography>
        )}

        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: isUser
              ? "#176B54"
              : isSuccess
                ? "#E8F5E9"
                : "#F3F5F8",
            color: isUser ? "#FFFFFF" : "#1C2935",
            borderRadius: 3,
            borderBottomRightRadius: isUser ? 0.5 : 12,
            borderBottomLeftRadius: isUser ? 12 : 0.5,
            border: isSuccess
              ? "1px solid #B7DFC4"
              : "1px solid transparent",
          }}
        >
          {isSuccess && (
            <Stack
              direction="row"
              
              spacing={1}
              sx={{ mb: 1, color: "#176B54", alignItems:"center" }}
            >
              <CheckCircleOutlineIcon fontSize="small" />
              <Typography variant="subtitle2" sx={{fontWeight:700}}>
                Registration update
              </Typography>
            </Stack>
          )}

          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {message.content}
          </Typography>

          {message.registration && (
            <RegistrationSummary
              registration={message.registration}
            />
          )}

{!isUser &&
  message.quickReplies &&
  message.quickReplies.length > 0 && (
    <QuickReplyOptions
      options={message.quickReplies}
      onSelect={onQuickReply ?? (() => {})}
      disabled={quickRepliesDisabled || !onQuickReply}
    />
  )}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              textAlign: "right",
              opacity: 0.65,
              fontSize: "0.68rem",
            }}
          >
            {formattedTime}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}