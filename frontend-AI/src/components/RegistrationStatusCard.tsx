/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { getRegistrationStatus } from "../services/registrationApi";
import type {
  RegistrationStatusResponse,
} from "../types/registrationStatus";

interface Props {
  eventId: number;
  refreshKey?: number;
}

export default function RegistrationStatusCard({
  eventId,
  refreshKey = 0,
}: Props) {
  const [status, setStatus] =
    useState<RegistrationStatusResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getRegistrationStatus(eventId);
      setStatus(data);
    } catch {
      setError("Unable to load registration status.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus, refreshKey]);

  const percentage = status
    ? status.maxTeams > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (status.registeredTeams / status.maxTeams) * 100
          )
        )
      : 0
    : 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "#E3E8EF",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack
            direction="row"
            sx={{alignItems:"center",
            justifyContent:"space-between"}}
            spacing={2}
          >
            <Box>
              <Typography variant="h6" sx={{fontWeight:700}}>
                Registration Status
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {status?.eventName ?? "Event registrations"}
              </Typography>
            </Box>

            <IconButton
              onClick={() => void loadStatus()}
              disabled={loading}
              aria-label="Refresh registration status"
            >
              <RefreshIcon />
            </IconButton>
          </Stack>

          {loading && <LinearProgress />}

          {error && (
            <Alert severity="error">{error}</Alert>
          )}

          {status && (
            <>
              {/* Registration availability */}
              <Chip
                label={
                  status.registrationOpen
                    ? "Registration Open"
                    : "Registration Closed"
                }
                color={
                  status.registrationOpen
                    ? "success"
                    : "error"
                }
                size="small"
                sx={{
                  alignSelf: "flex-start",
                  fontWeight: 700,
                }}
              />

              {/* Statistics */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                  },
                  gap: 2,
                }}
              >
                {[
                  {
                    label: "Team Capacity",
                    value: status.maxTeams,
                    icon: <GroupsOutlinedIcon />,
                  },
                  {
                    label: "Registered",
                    value: status.registeredTeams,
                    icon: <HowToRegOutlinedIcon />,
                  },
                  {
                    label: "Available",
                    value: status.availableSpots,
                    icon: <PersonAddAltOutlinedIcon />,
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      p: 2,
                      bgcolor: "#F5F7FA",
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ color: "#176B54", mb: 1 }}>
                      {item.icon}
                    </Box>

                    <Typography
                      variant="h4"
                      sx={{fontWeight:700}}
                    >
                      {item.value}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Progress */}
              <Box>
                <Stack
                  direction="row"
                  
                  sx={{ mb: 1, justifyContent:"space-between" }}
                >
                  <Typography
                    variant="body2"
                    sx={{fontWeight:600}}
                  >
                    Team Registrations
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {status.registeredTeams} / {status.maxTeams}
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={percentage}
                  color="success"
                  sx={{
                    height: 9,
                    borderRadius: 5,
                    bgcolor: "#E5E7EB",
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  {status.availableSpots > 0
                    ? `${status.availableSpots} team spaces remaining`
                    : "No team spaces remaining"}
                </Typography>
              </Box>

              {!status.registrationOpen && (
                <Alert severity="warning">
                  Registration is currently closed.
                </Alert>
              )}
            </>
          )}

          {loading && !status && (
            <Stack sx={{alignItems:"center"}}>
              <CircularProgress size={24} />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}