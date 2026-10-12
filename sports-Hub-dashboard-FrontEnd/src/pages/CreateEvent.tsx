import { useState } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import Sidebar from "../components/Sidebar";

export default function CreateEvent() {
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");

  const [u13, setU13] = useState(false);
  const [u15, setU15] = useState(false);

  const [numberOfTeams, setNumberOfTeams] = useState("");
  const [numberOfPitches, setNumberOfPitches] = useState("");

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [matchDuration, setMatchDuration] =
    useState("");

  const [breakDuration, setBreakDuration] =
    useState("");

  const handleSubmit = () => {
    console.log({
      eventName,
      eventType,
      date,
      venue,
      ageGroups: {
        u13,
        u15,
      },
      numberOfTeams,
      numberOfPitches,
      startTime,
      endTime,
      matchDuration,
      breakDuration,
    });

    alert("Event created successfully!");
  };

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
            Create Event
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Set up your sports event
          </Typography>
        </Box>

        {/* Event Details */}

        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Event Details
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Event Name"
                  placeholder="Gauteng Schools Football Festival"
                  value={eventName}
                  onChange={(e) =>
                    setEventName(e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Event Type"
                  value={eventType}
                  onChange={(e) =>
                    setEventType(e.target.value)
                  }
                >
                  <MenuItem value="Football Festival">
                    Football Festival
                  </MenuItem>

                  <MenuItem value="Tournament">
                    Tournament
                  </MenuItem>

                  <MenuItem value="League">
                    League
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Venue"
                  placeholder="TUT Sports Grounds"
                  value={venue}
                  onChange={(e) =>
                    setVenue(e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Competition Setup */}

        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2 }}
            >
              Competition Setup
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Select the age groups participating in
              the event.
            </Typography>

            <FormGroup row sx={{ mt: 1, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={u13}
                    onChange={(e) =>
                      setU13(e.target.checked)
                    }
                  />
                }
                label="U13"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={u15}
                    onChange={(e) =>
                      setU15(e.target.checked)
                    }
                  />
                }
                label="U15"
              />
            </FormGroup>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Teams"
                  value={numberOfTeams}
                  onChange={(e) =>
                    setNumberOfTeams(e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Number of Pitches"
                  value={numberOfPitches}
                  onChange={(e) =>
                    setNumberOfPitches(e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Scheduling */}

        <Card sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 3 }}
            >
              Scheduling
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="Start Time"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="time"
                  label="End Time"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Match Duration (minutes)"
                  value={matchDuration}
                  onChange={(e) =>
                    setMatchDuration(e.target.value)
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Break (minutes)"
                  value={breakDuration}
                  onChange={(e) =>
                    setBreakDuration(e.target.value)
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Submit */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            pb: 4,
          }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
          >
            Create Event
          </Button>
        </Box>
      </Box>
    </Box>
  );
}