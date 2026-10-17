import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StadiumIcon from "@mui/icons-material/Stadium";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

import type { TeamFixture } from "../types/fixture";

interface Props {
  fixture: TeamFixture;
}

export default function TeamFixtureCard({ fixture }: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "#E2E8F0",
        boxShadow: "none",
        mb: 2,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Chip
              label={`${fixture.ageGroup} ${fixture.division}`}
              size="small"
              sx={{
                bgcolor: "#DDF7E7",
                color: "#079447",
                fontWeight: 700,
              }}
            />

            <Chip label={fixture.status} variant="outlined" size="small" />
          </Stack>

          <Stack
            direction="row"
            sx={{ alignItems: "center", justifyContent: "space-between" }}
            spacing={1}
          >
            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                overflowWrap: "anywhere",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {fixture.details.homeTeam}
            </Typography>

            <SportsSoccerIcon sx={{ color: "#079447" }} />

            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                overflowWrap: "anywhere",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {fixture.details.awayTeam}
            </Typography>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">{fixture.kickOffTime}</Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <StadiumIcon fontSize="small" color="action" />
              <Typography variant="body2">Pitch {fixture.pitchId}</Typography>
            </Stack>
          </Stack>

          <Box
            sx={{
              bgcolor: "#F3F6FA",
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Opponent
            </Typography>

            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {fixture.opponent}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {fixture.isHomeGame ? "Home" : "Away"} game
              {" · "}
              {fixture.group}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
