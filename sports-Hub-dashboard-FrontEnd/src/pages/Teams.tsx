import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import Sidebar from "../components/Sidebar";
import AddTeamDialog from "../components/AddTeamDialog";
import { teamsApi, type TeamResponse } from "../api";

export default function Teams() {
  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadTeams = () => {
    teamsApi.list().then(setTeams);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fb" }}>
      <Sidebar />

      <Box component="main" sx={{ marginLeft: "240px", width: "calc(100% - 240px)", p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Teams</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Manage teams registered for your event
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{ bgcolor: "#079447", "&:hover": { bgcolor: "#06783A" }, textTransform: "none", fontWeight: 700 }}
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
                        No teams yet. Click "Add Team" to get started.
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
          </CardContent>
        </Card>
      </Box>

      <AddTeamDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          setDialogOpen(false);
          loadTeams();
        }}
      />
    </Box>
  );
}
