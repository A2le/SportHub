import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  FormLabel,
  TextField,
  Typography,
} from "@mui/material";

import { eventsApi, teamsApi, type CreateTeamRequest } from "../api";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function AddTeamDialog({ open, onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [coachPhone, setCoachPhone] = useState("");
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);

  const [availableAgeGroups, setAvailableAgeGroups] = useState<string[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoadingGroups(true);
    eventsApi.list()
      .then((events) => {
        const groups = new Set<string>();
        events.forEach((e) => {
          if (e.ageGroups) {
            e.ageGroups.split(",").forEach((g) => groups.add(g.trim()));
          }
        });
        setAvailableAgeGroups([...groups]);
      })
      .finally(() => setLoadingGroups(false));
  }, [open]);

  const toggleAgeGroup = (group: string) => {
    setSelectedAgeGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const reset = () => {
    setName("");
    setSchoolName("");
    setCoachName("");
    setCoachPhone("");
    setSelectedAgeGroups([]);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name || !schoolName || !coachName || !coachPhone || selectedAgeGroups.length === 0) {
      setError("Please fill in all fields and select at least one age group.");
      return;
    }

    const payload: CreateTeamRequest = {
      name,
      schoolName,
      coachName,
      coachPhone,
      ageGroup: selectedAgeGroups.join(","),
    };

    try {
      setSubmitting(true);
      await teamsApi.create(payload);
      reset();
      onCreated();
    } catch {
      setError("Failed to create team. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Add Team</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
        <TextField
          label="Team Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="School Name"
          fullWidth
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
        />
        <TextField
          label="Coach Name"
          fullWidth
          value={coachName}
          onChange={(e) => setCoachName(e.target.value)}
        />
        <TextField
          label="Coach Phone"
          fullWidth
          value={coachPhone}
          onChange={(e) => setCoachPhone(e.target.value)}
        />

        <Box>
          <FormLabel sx={{ fontWeight: 600, mb: 1, display: "block" }}>Age Group</FormLabel>
          {loadingGroups ? (
            <CircularProgress size={20} />
          ) : availableAgeGroups.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No age groups found. Create a tournament first.
            </Typography>
          ) : (
            <FormGroup row>
              {availableAgeGroups.map((group) => (
                <FormControlLabel
                  key={group}
                  label={group}
                  control={
                    <Checkbox
                      checked={selectedAgeGroups.includes(group)}
                      onChange={() => toggleAgeGroup(group)}
                    />
                  }
                />
              ))}
            </FormGroup>
          )}
        </Box>

        {error && (
          <Typography variant="body2" color="error">{error}</Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={submitting}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{ bgcolor: "#079447", "&:hover": { bgcolor: "#06783A" } }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Add Team"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
