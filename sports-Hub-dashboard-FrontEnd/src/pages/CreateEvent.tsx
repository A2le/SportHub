import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../api";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import NotesIcon from "@mui/icons-material/Notes";

import Sidebar from "../components/Sidebar";

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, subtitle, children }: SectionCardProps) {
  return (
    <Card sx={{ borderRadius: 3, mb: 3, overflow: "hidden", boxShadow: "0 4px 18px rgba(16,29,51,0.07)" }}>
      <Box sx={{ bgcolor: "#079447", px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: "white", display: "flex" }}>{icon}</Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "white", lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );
}

const today = new Date().toISOString().split("T")[0];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#079447" },
    "&.Mui-focused fieldset": { borderColor: "#079447" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#079447" },
};

export default function CreateEvent() {
  const navigate = useNavigate();

  // Event Details
  const [eventName, setEventName] = useState("");
  const [sportCategory, setSportCategory] = useState("");
  const [eventType, setEventType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");

  // Competition Setup
  const [u11, setU11] = useState(false);
  const [u15, setU15] = useState(false);
  const [u19, setU19] = useState(false);
  const [numberOfTeams, setNumberOfTeams] = useState("");

  // Scheduling — event window
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Scheduling — pitch window (must be within event window)
  const [pitchStartTime, setPitchStartTime] = useState("");
  const [pitchEndTime, setPitchEndTime] = useState("");

  const [matchDuration, setMatchDuration] = useState("");
  const [breakDuration, setBreakDuration] = useState("");
  const [maxMatchesPerTeam, setMaxMatchesPerTeam] = useState("");
  const [minRestTime, setMinRestTime] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedAgeGroups = [u11 && "U11", u15 && "U15", u19 && "U19"].filter(Boolean) as string[];
  const resolvedSport = sportCategory.trim();

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!eventName.trim()) e.eventName = "Event name is required.";
    if (!resolvedSport.trim()) e.sportCategory = "Sport is required.";
    if (!eventType.trim()) e.eventType = "Event type is required.";
    if (!startDate) e.startDate = "Start date is required.";
    if (!endDate) e.endDate = "End date is required.";
    if (startDate && endDate && endDate < startDate) e.endDate = "End date cannot be before start date.";
    if (!venue.trim()) e.venue = "Venue is required.";
    if (selectedAgeGroups.length === 0) e.ageGroups = "Select at least one age group.";
    if (!numberOfTeams || Number(numberOfTeams) < 2) e.numberOfTeams = "Minimum 2 teams required.";

    // Event times
    if (!startTime) e.startTime = "Event start time is required.";
    if (!endTime) e.endTime = "Event end time is required.";
    if (startTime && endTime && endTime <= startTime) e.endTime = "End time must be after start time.";

    // Pitch times
    if (!pitchStartTime) e.pitchStartTime = "Pitch start time is required.";
    if (!pitchEndTime) e.pitchEndTime = "Pitch end time is required.";
    if (pitchStartTime && startTime && pitchStartTime < startTime)
      e.pitchStartTime = "Pitch start time cannot be before event start time.";
    if (pitchEndTime && endTime && pitchEndTime > endTime)
      e.pitchEndTime = "Pitch end time cannot be after event end time.";
    if (pitchStartTime && pitchEndTime && pitchEndTime <= pitchStartTime)
      e.pitchEndTime = "Pitch end time must be after pitch start time.";

    if (!matchDuration || Number(matchDuration) < 1) e.matchDuration = "Match duration must be at least 1 minute.";
    if (!breakDuration || Number(breakDuration) < 0) e.breakDuration = "Break duration cannot be negative.";
    if (!maxMatchesPerTeam || Number(maxMatchesPerTeam) < 1) e.maxMatchesPerTeam = "Must be at least 1.";
    if (!minRestTime || Number(minRestTime) < 0) e.minRestTime = "Min rest time cannot be negative.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await eventsApi.create({
        name: eventName,
        eventType: `${resolvedSport} ${eventType}`.trim(),
        sportCategory: resolvedSport,
        venue,
        description,
        startDate,
        endDate,
        startTime,
        endTime,
        pitchStartTime,
        pitchEndTime,
        numberOfTeams: Number(numberOfTeams),
        ageGroups: selectedAgeGroups.join(","),
        matchDurationMinutes: Number(matchDuration),
        breakBetweenMatchesMinutes: Number(breakDuration),
        maxMatchesPerTeam: Number(maxMatchesPerTeam),
        minRestTimeBetweenMatches: Number(minRestTime),
      });
      navigate("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#F3F6FA" }}>
      <Sidebar />

      <Box component="main" sx={{ marginLeft: "240px", width: "calc(100% - 240px)", p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#101D33" }}>Create Event</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Set up a new sports tournament</Typography>
        </Box>

        {/* Event Details */}
        <SectionCard icon={<EmojiEventsIcon />} title="Event Details" subtitle="Basic information about your tournament">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Event Name"
                placeholder="Gauteng Schools Football Festival"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                error={!!errors.eventName}
                helperText={errors.eventName}
                sx={fieldSx}
              />
            </Grid>

            {/* Sport — simple dropdown */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Sport"
                value={sportCategory}
                onChange={(e) => setSportCategory(e.target.value)}
                error={!!errors.sportCategory}
                helperText={errors.sportCategory}
                sx={fieldSx}
              >
                <MenuItem value="Football">Football</MenuItem>
                <MenuItem value="Rugby">Rugby</MenuItem>
                <MenuItem value="Netball">Netball</MenuItem>
              </TextField>
            </Grid>

            {/* Event Type — free text e.g. Festival, Tournament, League */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Event Type"
                placeholder="Festival, Tournament, League..."
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                error={!!errors.eventType}
                helperText={errors.eventType ?? "e.g. Festival, Tournament, League"}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Venue"
                placeholder="TUT Sports Grounds"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                error={!!errors.venue}
                helperText={errors.venue}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: today } }}
                error={!!errors.startDate}
                helperText={errors.startDate}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDate || today } }}
                error={!!errors.endDate}
                helperText={errors.endDate}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  if (pitchStartTime && pitchStartTime < e.target.value) setPitchStartTime("");
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.startTime}
                helperText={errors.startTime}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="time"
                label="End Time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  if (pitchEndTime && pitchEndTime > e.target.value) setPitchEndTime("");
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                error={!!errors.endTime}
                helperText={errors.endTime}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Description */}
        <SectionCard icon={<NotesIcon />} title="Description" subtitle="Optional details about the event">
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            placeholder="Provide any additional details about the event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={fieldSx}
          />
        </SectionCard>

        {/* Competition Setup */}
        <SectionCard icon={<CheckCircleOutlinedIcon />} title="Competition Setup" subtitle="Age groups and team configuration">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Select the age groups participating in the event.
          </Typography>

          <FormGroup row sx={{ mb: 1, gap: 1 }}>
            {[
              { label: "U11", checked: u11, set: setU11 },
              { label: "U15", checked: u15, set: setU15 },
              { label: "U19", checked: u19, set: setU19 },
            ].map(({ label, checked, set }) => (
              <FormControlLabel
                key={label}
                label={label}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(e) => set(e.target.checked)}
                    sx={{ color: "#079447", "&.Mui-checked": { color: "#079447" } }}
                  />
                }
                sx={{
                  border: "1px solid",
                  borderColor: checked ? "#079447" : "#E2E8F0",
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: checked ? "#DDF7E7" : "white",
                  transition: "all 0.15s",
                }}
              />
            ))}
          </FormGroup>

          {errors.ageGroups && (
            <Typography variant="caption" color="error" sx={{ mb: 2, display: "block" }}>
              {errors.ageGroups}
            </Typography>
          )}

          {selectedAgeGroups.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
              {selectedAgeGroups.map((g) => (
                <Chip key={g} label={g} size="small" sx={{ bgcolor: "#DDF7E7", color: "#079447", fontWeight: 700 }} />
              ))}
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Number of Teams"
                value={numberOfTeams}
                onChange={(e) => setNumberOfTeams(e.target.value)}
                slotProps={{ htmlInput: { min: 2 } }}
                error={!!errors.numberOfTeams}
                helperText={errors.numberOfTeams || "Minimum 2 teams"}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {/* Scheduling */}
        <SectionCard icon={<AccessTimeIcon />} title="Scheduling" subtitle="Pitch availability and match configuration">
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#101D33", mb: 1 }}>
            Pitch Availability
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            Must fall within the event window above.
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="time"
                label="Pitch Start Time"
                value={pitchStartTime}
                onChange={(e) => setPitchStartTime(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { min: startTime || undefined },
                }}
                error={!!errors.pitchStartTime}
                helperText={errors.pitchStartTime || (startTime ? `From ${startTime} onwards` : "")}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="time"
                label="Pitch End Time"
                value={pitchEndTime}
                onChange={(e) => setPitchEndTime(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  htmlInput: { max: endTime || undefined },
                }}
                error={!!errors.pitchEndTime}
                helperText={errors.pitchEndTime || (endTime ? `Up to ${endTime}` : "")}
                sx={fieldSx}
              />
            </Grid>
          </Grid>

          <Typography variant="body2" sx={{ fontWeight: 600, color: "#101D33", mb: 2 }}>
            Match Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Match Duration (minutes)"
                value={matchDuration}
                onChange={(e) => setMatchDuration(e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
                error={!!errors.matchDuration}
                helperText={errors.matchDuration}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Break Between Matches (minutes)"
                value={breakDuration}
                onChange={(e) => setBreakDuration(e.target.value)}
                slotProps={{ htmlInput: { min: 0 } }}
                error={!!errors.breakDuration}
                helperText={errors.breakDuration}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Matches Per Team"
                value={maxMatchesPerTeam}
                onChange={(e) => setMaxMatchesPerTeam(e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
                error={!!errors.maxMatchesPerTeam}
                helperText={errors.maxMatchesPerTeam}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Min Rest Time Between Matches (minutes)"
                value={minRestTime}
                onChange={(e) => setMinRestTime(e.target.value)}
                slotProps={{ htmlInput: { min: 0 } }}
                error={!!errors.minRestTime}
                helperText={errors.minRestTime || "Minimum rest a team gets between matches"}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </SectionCard>

        {Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Please fix the errors above before submitting.
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pb: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/dashboard")}
            sx={{
              borderColor: "#079447",
              color: "#079447",
              "&:hover": { borderColor: "#06783A", bgcolor: "#DDF7E7" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 4,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{
              bgcolor: "#079447",
              "&:hover": { bgcolor: "#06783A" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 4,
            }}
          >
            {submitting ? "Creating..." : "Create Event"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
