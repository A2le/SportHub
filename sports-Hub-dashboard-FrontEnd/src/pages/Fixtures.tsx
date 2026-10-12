import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import Sidebar from "../components/Sidebar";
import { tournaments } from "../data/mockData";
import type { Tournament } from "../data/mockData";

interface Fixture {
  time: string;
  pitch: string;
  match: string;
  tournamentId: string;
}

const event: Tournament = tournaments[0];

const fixtures: Fixture[] = tournaments.map((t, i) => ({
  time: `${8 + i}:00`,
  pitch: `Pitch ${t.pitches || 1}`,
  match: t.name,
  tournamentId: t.id,
}));

export default function Fixtures() {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          marginLeft: "240px",
          width: "calc(100% - 240px)",
          p: 4,
        }}
      >
        {/* Header */}

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
          >
            Fixtures
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Match schedule for {event.name}
          </Typography>
        </Box>

        {/* Event Summary */}

        <Card
          sx={{
            borderRadius: 3,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CalendarMonthIcon
                sx={{ fontSize: 40 }}
              />

              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  {event.date}
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  {event.venue} • {event.pitches} Pitch
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Next Match */}

        <Card
          sx={{
            borderRadius: 3,
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Next Match
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 3,
                borderRadius: 2,
                backgroundColor: "#f8fafc",
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700 }}
                >
                  {fixtures[0].match}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {fixtures[0].pitch}
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{ fontWeight: 700 }}
              >
                {fixtures[0].time}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Fixtures Table */}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Time</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Pitch</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Match</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {fixtures.map((fixture) => (
                    <TableRow key={fixture.time}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>
                          {fixture.time}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {fixture.pitch}
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {fixture.match}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label="Scheduled"
                          color="info"
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}