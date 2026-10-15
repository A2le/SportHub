/* eslint-disable react-hooks/set-state-in-effect */
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getRegistrationStatus } from "../services/registrationApi";

interface Props {
  eventId: number;
}

export default function RegistrationStatusCard({
  eventId,
}: Props) {
  const [status, setStatus] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    getRegistrationStatus(eventId)
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [eventId]);

  if (loading) return <CircularProgress size={24} />;

  if (error) {
    return (
      <Alert severity="warning">
        Unable to load registration status.
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: "#f5f7fb", borderRadius: 2 }}>
      <Typography variant="subtitle1" sx={{fontWeight:700}}>
        Registration Status
      </Typography>

      <Typography
        component="pre"
        sx={{
          fontSize: 12,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {JSON.stringify(status, null, 2)}
      </Typography>
    </Box>
  );
}