import {
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { AgentEventInfo } from "../types/agentEvent";

interface Props {
  event: AgentEventInfo;
}

export default function EventDetailsCard({ event }: Props) {
  return (
    <Card sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{fontWeight:700}}>
            {event.name}
          </Typography>

          <Chip
            label={event.status}
            color="primary"
            sx={{ width: "fit-content" }}
          />

          <Typography>Venue: {event.venue}</Typography>

          <Typography>
            Dates: {event.startDate} - {event.endDate}
          </Typography>

          <Divider />

          <Typography>
            Age groups: {event.ageGroups}
          </Typography>

          <Typography>
            Maximum teams: {event.maxTeams}
          </Typography>

          <Typography>
            Pitch availability: {event.pitchStartTime} -{" "}
            {event.pitchEndTime}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}