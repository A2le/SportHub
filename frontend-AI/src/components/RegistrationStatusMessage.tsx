import {
  Box,
  Chip,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { RegistrationStatusResponse } from "../types/registrationStatus";

interface Props {
  status: RegistrationStatusResponse;
}

export default function RegistrationStatusMessage({ status }: Props) {
  const percentage =
    status.maxTeams > 0
      ? Math.min(
          100,
          Math.max(0, (status.registeredTeams / status.maxTeams) * 100),
        )
      : 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        bgcolor: "#FFFFFF",
        borderColor: "#E2E8F0",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
          spacing={1}
        >
          <Typography sx={{ jfontWeight: 700 }}>Team Registration</Typography>

          <Chip
            size="small"
            label={status.registrationOpen ? "Open" : "Closed"}
            color={status.registrationOpen ? "success" : "error"}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {status.eventName}
        </Typography>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 1,
          }}
        >
          {[
            { label: "Capacity", value: status.maxTeams },
            {
              label: "Registered",
              value: status.registeredTeams,
            },
            {
              label: "Available",
              value: status.availableSpots,
            },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                p: 1.5,
                textAlign: "center",
                borderRadius: 2,
                bgcolor: "#F3F6FA",
                minWidth: 0,
              }}
            >
              <Typography
                variant="h5"
                sx={{ jfontWeight: 800 }}
                color="#101D33"
              >
                {item.value}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box>
          <Stack
            direction="row"
            sx={{ mb: 1, justifyContent: "space-between" }}
          >
            <Typography variant="caption" color="text.secondary">
              Registration progress
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {status.registeredTeams} / {status.maxTeams}
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={percentage}
            color="success"
            sx={{
              height: 8,
              borderRadius: 5,
              bgcolor: "#E2E8F0",
            }}
          />
        </Box>

       
        <Stack spacing={0.5} direction={"row"}>
          <Typography
            variant="body2"
            sx={{fontWeight: 700,color:status.registrationOpen ? "#079447" : "error.main", mr: 4 }}
            
          >
            {status.status}
          </Typography>

          <Typography variant="body2" sx={{color:"text.secondary", ml: 4}}>
            {status.registrationOpen
              ? `${status.availableSpots} team spaces remaining`
              : "Registration is currently closed"}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
