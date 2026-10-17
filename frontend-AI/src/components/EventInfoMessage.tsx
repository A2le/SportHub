
import {
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import type { AgentEventInfo } from "../types/agentEvent";

interface Props {
  event: AgentEventInfo;
}

export default function EventInfoMessage({ event }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        p: 2,
        bgcolor: "#FFFFFF",
        borderRadius: 3,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} sx={{alignItems:"center"}}>
          <SportsSoccerIcon sx={{ color: "#079447" }} />
          <Typography sx={{fontWeight:700}}>
            {event.name}
          </Typography>
        </Stack>

        <Chip
          label={event.status}
          size="small"
          color="success"
          sx={{ alignSelf: "flex-start" }}
        />

        <Divider />

        <Typography variant="body2">
          Venue: {event.venue}
        </Typography>

        <Typography variant="body2">
          Date: {event.startDate} – {event.endDate}
        </Typography>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Age Groups
          </Typography>
          <Typography sx={{fontWeight:600}}>
            {event.ageGroups}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Maximum Teams
          </Typography>
          <Typography sx={{fontWeight:600}}>
            {event.maxTeams}
          </Typography>
        </Box>

        <Typography variant="body2">
          Pitch Availability: {event.pitchStartTime} –{" "}
          {event.pitchEndTime}
        </Typography>
      </Stack>
    </Paper>
  );
}
