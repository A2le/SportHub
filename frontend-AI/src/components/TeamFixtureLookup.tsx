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
import FixtureCard from "./FixtureCard";
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
    const id = Number(teamId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Enter a valid team ID.");
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
      <Typography variant="h6" sx={{fontWeight:700, mb:2}}>
        Check Team Fixtures
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Team ID"
          type="number"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          disabled={loading}
          onClick={() => void handleSearch()}
        >
          Check Fixtures
        </Button>

        {loading && <CircularProgress size={24} />}

        {error && <Alert severity="error">{error}</Alert>}

        {fixtures && fixtures.fixtureCount === 0 && (
  <Alert severity="info">
    No fixtures are currently available for Team {fixtures.teamId}
    in Event {fixtures.eventId}.
    Please check again after the organiser generates the match schedule.
  </Alert>
)}

{fixtures && fixtures.fixtureCount > 0 && (
  <Box sx={{ bgcolor: "#f5f7fb", p: 2, borderRadius: 2 }}>
    {/* <Typography variant="h6" sx={{mb:2}}>
      Team Fixtures ({fixtures.fixtureCount})
    </Typography> */}

   {fixtures && fixtures.fixtureCount === 0 && (
  <Alert severity="info">
    No fixtures are available for this team yet.
  </Alert>
)}

{fixtures && fixtures.fixtureCount > 0 && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="h6" sx={{fontWeight:700, md:2}}>
      Team Fixtures ({fixtures.fixtureCount})
    </Typography>

    {fixtures.fixtures.map((fixture) => (
      <FixtureCard
        key={fixture.id}
        fixture={fixture}
      />
    ))}
  </Box>
)}
  </Box>
)}
      </Stack>
    </Box>
  );
}