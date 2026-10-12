import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import Sidebar from "../components/Sidebar";
import { tournaments } from "../data/mockData";

interface Team {
  name: string;
  school: string;
  age: string;
  status: string;
  tournament: string;
}

const teams: Team[] = tournaments.flatMap((t) =>
  t.ageGroups.map((age) => ({
    name: t.name,
    school: t.venue,
    age,
    status: t.status,
    tournament: t.id,
  }))
);

export default function Teams() {
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              Teams
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Manage teams registered for your event
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Add Team
          </Button>
        </Box>

        {/* Teams Table */}

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Team</strong>
                    </TableCell>

                    <TableCell>
                      <strong>School</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Age</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {teams.map((team, i) => (
                    <TableRow key={`${team.name}-${i}`}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>
                          {team.name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {team.school}
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={team.age}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={team.status}
                          size="small"
                          color={
                            team.status === "Registered"
                              ? "success"
                              : "warning"
                          }
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