import { useEffect, useState } from "react";

import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import Sidebar from "../components/Sidebar";
import { teamsApi, type TeamResponse } from "../api";

export default function Teams() {
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamsApi.list().then(setTeams).finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fb" }}>
      <Sidebar />

      <Box component="main" sx={{ marginLeft: "240px", width: "calc(100% - 240px)", p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Teams</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Teams registered across your events
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Team</strong></TableCell>
                      <TableCell><strong>School</strong></TableCell>
                      <TableCell><strong>Coach</strong></TableCell>
                      <TableCell><strong>Phone</strong></TableCell>
                      <TableCell><strong>Age Group</strong></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {teams.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                          No teams registered yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      teams.map((team) => (
                        <TableRow key={team.id}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>{team.name}</Typography>
                          </TableCell>
                          <TableCell>{team.schoolName}</TableCell>
                          <TableCell>{team.coachName}</TableCell>
                          <TableCell>{team.coachPhone}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                              {team.ageGroup.split(",").map((g) => (
                                <Chip key={g} label={g.trim()} size="small" />
                              ))}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
