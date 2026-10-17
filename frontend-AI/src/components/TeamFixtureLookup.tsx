
import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { getTeamFixtures } from "../services/fixtureApi";
import type { TeamFixturesResponse } from "../types/fixture";
import TeamFixtureCard from "./TeamFixtureCard";

interface Props {
  eventId: number;
}

export default function TeamFixtureLookup({ eventId }: Props) {
  const [teamId, setTeamId] = useState("");

  const [fixtures, setFixtures] =
    useState<TeamFixturesResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const id = Number(teamId.trim());

    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Please enter a valid team ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setFixtures(null);

    try {
      const data = await getTeamFixtures(id, eventId);
      setFixtures(data);
    } catch {
      setError("Unable to retrieve fixtures for this team.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 2,
          color: "#101D33",
        }}
      >
        Check Team Fixtures
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Team ID"
          type="number"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          fullWidth
          size="small"
        />

        <Button
          variant="contained"
          disabled={loading}
          onClick={() => void handleSearch()}
          sx={{
            bgcolor: "#079447",
            "&:hover": {
              bgcolor: "#06783A",
            },
          }}
        >
          Check Fixtures
        </Button>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {/* No fixtures available */}
        {fixtures && fixtures.fixtures.length === 0 && (
          <Alert severity="info">
            No fixtures are currently available for Team{" "}
            {fixtures.teamId} in Event {fixtures.eventId}.
            Please check again after the organiser generates
            the match schedule.
          </Alert>
        )}

        {/* Fixtures available */}
        {fixtures && fixtures.fixtures.length > 0 && (
          <Box
            sx={{
              bgcolor: "#F3F6FA",
              p: 2,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "#101D33",
              }}
            >
              Team Fixtures ({fixtures.fixtureCount})
            </Typography>

            {fixtures.fixtures.map((fixture) => (
              <TeamFixtureCard
                key={fixture.id}
                fixture={fixture}
              />
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
}
