import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import StadiumIcon from "@mui/icons-material/Stadium";

import type { Fixture } from "../types/fixture";

interface Props {
  fixture: Fixture;
}

export default function FixtureCard({ fixture }: Props) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        mb: 2,
        borderColor: "#E3E8EF",
        "&:hover": {
          borderColor: "#176B54",
          boxShadow: 2,
        },
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{justifyContent:"space-between",
            alignItems:"center"}}
          >
            <Chip
              label={`${fixture.ageGroup} ${fixture.division}`}
              size="small"
              color="success"
              variant="outlined"
            />

            <Typography variant="caption" color="text.secondary">
              Match #{fixture.id}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            sx={{alignItems:"center",
            justifyContent:"space-between"}}
            spacing={2}
          >
            <Typography
              
              sx={{ flex: 1, fontWeight:700, textAlign:"center" }}
            >
              {fixture.homeTeam}
            </Typography>

            <SportsSoccerIcon sx={{ color: "#176B54" }} />

            <Typography
              
              sx={{ flex: 1, fontWeight:700, textAlign:"center" }}
            >
              {fixture.awayTeam}
            </Typography>
          </Stack>

          <Divider />

          <Stack
            direction="row"
            sx={{justifyContent:"space-around"}}
            spacing={2}
          >
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2">
                {fixture.kickOffTime}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <StadiumIcon fontSize="small" color="action" />
              <Typography variant="body2">
                Pitch {fixture.pitchId}
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}