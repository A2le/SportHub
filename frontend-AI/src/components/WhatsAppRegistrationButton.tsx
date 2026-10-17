
import { Alert, Button, Stack } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

import type { AgentEventInfo } from "../types/agentEvent";

interface Props {
  event: AgentEventInfo;
}

export default function WhatsAppRegistrationButton({
  event,
}: Props) {
  const phoneNumber = (
    import.meta.env.VITE_WHATSAPP_NUMBER || ""
  ).replace(/\D/g, "");

  const message =
    `Hi SportsHub AI! I would like to register my team ` +
    `for ${event.name}. Event ID: ${event.id}`;

  const whatsappUrl = phoneNumber
    ? `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    : "";

  return (
    <Stack spacing={1}>
      <Button
        variant="outlined"
        startIcon={<WhatsAppIcon />}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        disabled={!phoneNumber}
        sx={{
          borderColor: "#079447",
          color: "#079447",
          fontWeight: 700,
          textTransform: "none",
          borderRadius: 2,
          "&:hover": {
            bgcolor: "#DDF7E7",
            borderColor: "#06783A",
          },
        }}
      >
        Continue on WhatsApp
      </Button>

      {!phoneNumber && (
        <Alert severity="info">
          WhatsApp will be available once the
          business number is configured.
        </Alert>
      )}
    </Stack>
  );
}
