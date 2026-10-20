import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import Sidebar from "../components/Sidebar";
import { eventsApi, registrationsApi, type EventResponse, type RegistrationResponse } from "../api";

function isEditAllowed(startDate: string): boolean {
  const eventStart = new Date(`${startDate}T00:00:00`);
  const now = new Date();
  const diffMs = eventStart.getTime() - now.getTime();
  return diffMs >= 24 * 60 * 60 * 1000;
}

function hoursUntil(startDate: string): number {
  const eventStart = new Date(`${startDate}T00:00:00`);
  return Math.round((eventStart.getTime() - Date.now()) / (1000 * 60 * 60));
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5 }}>
      <Box sx={{ color: "#079447", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{value}</Typography>
      </Box>
    </Box>
  );
}

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#079447" },
    "&.Mui-focused fieldset": { borderColor: "#079447" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#079447" },
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // edit form state
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [numberOfTeams, setNumberOfTeams] = useState("");
  const [matchDuration, setMatchDuration] = useState("");
  const [breakDuration, setBreakDuration] = useState("");
  const [u13, setU13] = useState(false);
  const [u15, setU15] = useState(false);
  const [u17, setU17] = useState(false);

  useEffect(() => {
    if (!id) return;
    eventsApi.get(Number(id))
      .then((ev) => {
        setEvent(ev);
        populateForm(ev);
        return registrationsApi.getByEvent(Number(id)).catch(() => []);
      })
      .then((regs) => setRegistrations(regs as RegistrationResponse[]))
      .catch((err: Error) => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  function populateForm(ev: EventResponse) {
    setName(ev.name);
    setEventType(ev.eventType);
    setVenue(ev.venue);
    setDate(ev.startDate);
    setStartTime(ev.startTime);
    setEndTime(ev.endTime);
    setNumberOfTeams(String(ev.numberOfTeams));
    setMatchDuration(String(ev.matchDurationMinutes));
    setBreakDuration(String(ev.breakBetweenMatchesMinutes));
    const groups = ev.ageGroups?.split(",").map((g) => g.trim()) ?? [];
    setU13(groups.includes("U13"));
    setU15(groups.includes("U15"));
    setU17(groups.includes("U17"));
  }

  const handleSave = async () => {
    if (!event) return;
    setSaving(true);
    setSaveError("");
    try {
      const ageGroups = [u13 && "U13", u15 && "U15", u17 && "U17"].filter(Boolean).join(",");
      const updated = await eventsApi.update(event.id, {
        name,
        eventType,
        venue,
        startDate: date,
        endDate: date,
        startTime,
        endTime,
        numberOfTeams: Number(numberOfTeams),
        pitchStartTime: startTime,
        pitchEndTime: endTime,
        ageGroups,
        matchDurationMinutes: Number(matchDuration),
        breakBetweenMatchesMinutes: Number(breakDuration),
      });
      setEvent(updated);
      setEditing(false);
    } catch {
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (event) populateForm(event);
    setEditing(false);
    setSaveError("");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F3F6FA" }}>
        <Sidebar />
        <Box sx={{ ml: "240px", flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <CircularProgress sx={{ color: "#079447" }} />
        </Box>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F3F6FA" }}>
        <Sidebar />
        <Box sx={{ ml: "240px", flex: 1, p: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
            sx={{ color: "#079447", textTransform: "none", fontWeight: 600, mb: 2, pl: 0 }}
          >
            Back to Dashboard
          </Button>
          <Alert severity="error">
            {fetchError || "Event not found."}
          </Alert>
        </Box>
      </Box>
    );
  }

  const canEdit = isEditAllowed(event.startDate);
  const hours = hoursUntil(event.startDate);
  const ageGroupList = event.ageGroups?.split(",").map((g) => g.trim()).filter(Boolean) ?? [];
  const formatDate = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F3F6FA" }}>
      <Sidebar />

      <Box component="main" sx={{ ml: "240px", width: "calc(100% - 240px)", p: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard")}
              sx={{ color: "#079447", textTransform: "none", fontWeight: 600, mb: 1, pl: 0 }}
            >
              Back to Dashboard
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#101D33" }}>{event.name}</Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
              <Chip label={event.eventType} size="small" sx={{ bgcolor: "#DDF7E7", color: "#079447", fontWeight: 700 }} />
              {ageGroupList.map((g) => (
                <Chip key={g} label={g} size="small" variant="outlined" />
              ))}
            </Box>
          </Box>

          {!editing && (
            <Tooltip
              title={canEdit ? "" : `Editing locked — event starts in less than 24 hours (${hours}h away)`}
              arrow
            >
              <span>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  disabled={!canEdit}
                  onClick={() => setEditing(true)}
                  sx={{
                    bgcolor: "#079447",
                    "&:hover": { bgcolor: "#06783A" },
                    "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  Edit Event
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>

        {!canEdit && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            This event starts in less than 24 hours — editing is locked.
          </Alert>
        )}

        {saveError && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{saveError}</Alert>}

        <Grid container spacing={3}>
          {/* Left column — event details */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 18px rgba(16,29,51,0.07)", mb: 3 }}>
              <Box sx={{ bgcolor: "#079447", px: 3, py: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmojiEventsIcon sx={{ color: "white" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>
                  {editing ? "Edit Event Details" : "Event Details"}
                </Typography>
              </Box>

              <CardContent sx={{ p: 3 }}>
                {editing ? (
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Event Name" value={name} onChange={(e) => setName(e.target.value)} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth select label="Event Type" value={eventType} onChange={(e) => setEventType(e.target.value)} sx={fieldSx}>
                        <MenuItem value="Football Festival">Football Festival</MenuItem>
                        <MenuItem value="Tournament">Tournament</MenuItem>
                        <MenuItem value="League">League</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="time" label="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="time" label="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="number" label="Number of Teams" value={numberOfTeams} onChange={(e) => setNumberOfTeams(e.target.value)} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="number" label="Match Duration (min)" value={matchDuration} onChange={(e) => setMatchDuration(e.target.value)} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth type="number" label="Break Duration (min)" value={breakDuration} onChange={(e) => setBreakDuration(e.target.value)} sx={fieldSx} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Age Groups</Typography>
                      <FormGroup row sx={{ gap: 1 }}>
                        {[{ label: "U13", checked: u13, set: setU13 }, { label: "U15", checked: u15, set: setU15 }, { label: "U17", checked: u17, set: setU17 }].map(({ label, checked, set }) => (
                          <FormControlLabel
                            key={label}
                            label={label}
                            control={<Checkbox checked={checked} onChange={(e) => set(e.target.checked)} sx={{ color: "#079447", "&.Mui-checked": { color: "#079447" } }} />}
                            sx={{
                              border: "1px solid",
                              borderColor: checked ? "#079447" : "#E2E8F0",
                              borderRadius: 2,
                              px: 1.5,
                              bgcolor: checked ? "#DDF7E7" : "white",
                            }}
                          />
                        ))}
                      </FormGroup>
                    </Grid>
                  </Grid>
                ) : (
                  <>
                    <InfoRow icon={<CalendarMonthIcon />} label="Date" value={formatDate(event.startDate)} />
                    <Divider />
                    <InfoRow icon={<LocationOnOutlinedIcon />} label="Venue" value={event.venue} />
                    <Divider />
                    <InfoRow icon={<AccessTimeIcon />} label="Time" value={`${event.startTime} – ${event.endTime}`} />
                    <Divider />
                    <InfoRow icon={<GroupsIcon />} label="Teams Capacity" value={`${event.numberOfTeams} teams`} />
                    <Divider />
                    <InfoRow icon={<AccessTimeIcon />} label="Match Duration" value={`${event.matchDurationMinutes} min matches · ${event.breakBetweenMatchesMinutes} min break`} />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Edit action buttons */}
            {editing && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  sx={{ borderColor: "#079447", color: "#079447", "&:hover": { bgcolor: "#DDF7E7" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ bgcolor: "#079447", "&:hover": { bgcolor: "#06783A" }, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            )}
          </Grid>

          {/* Right column — registered teams */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Card sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0 4px 18px rgba(16,29,51,0.07)" }}>
              <Box sx={{ bgcolor: "#079447", px: 3, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <GroupsIcon sx={{ color: "white" }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "white" }}>Registered Teams</Typography>
                </Box>
                <Chip
                  label={`${registrations.length} / ${event.numberOfTeams}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
                />
              </Box>

              <CardContent sx={{ p: 0 }}>
                {registrations.length === 0 ? (
                  <Box sx={{ py: 5, textAlign: "center" }}>
                    <Typography color="text.secondary">No teams registered yet.</Typography>
                  </Box>
                ) : (
                  registrations.map((reg, i) => (
                    <Box key={reg.id}>
                      <Box sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: "#DDF7E7",
                              color: "#079447",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            {i + 1}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 600 }}>{reg.teamName}</Typography>
                            <Typography variant="caption" color="text.secondary">{reg.ageGroup}</Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={reg.status}
                          size="small"
                          color={reg.status === "Confirmed" ? "success" : "default"}
                        />
                      </Box>
                      {i < registrations.length - 1 && <Divider />}
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
