
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import Sidebar from "../components/Sidebar";
import { tournaments } from "../data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");

  const sports = [
    "All",
    ...new Set(tournaments.map((item) => item.sport)),
  ];

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.venue.toLowerCase().includes(search.toLowerCase());

      const matchesSport =
        sport === "All" || item.sport === sport;

      return matchesSearch && matchesSport;
    });
  }, [search, sport]);

  const totalTeams = tournaments.reduce(
    (sum, item) => sum + item.registeredTeams,
    0
  );

  const upcomingEvents = tournaments.filter(
    (item) => item.status === "Upcoming" ||
      item.status === "Registration Open"
  ).length;

  const formatDate = (date: string) =>
    new Date(`${date}T12:00:00`).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const statusColor = (
    status: string
  ): "success" | "default" | "info" | "primary" => {
    switch (status) {
      case "Registration Open":
        return "success";
      case "Upcoming":
        return "info";
      case "Completed":
        return "default";
      default:
        return "primary";
    }
  };

  return (

  <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          width: "100%",
          bgcolor: "#F3F6FA",
        }}
      >
        <Sidebar />

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            ml: "240px",
            p: { xs: 2, md: 4 },
            bgcolor: "#F3F6FA",
            boxSizing: "border-box",
          }}
        >

        {/* Page heading */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: "#101D33" }}
            >
              Your Tournaments
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Manage your sports events in one place.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/create-event")}
            sx={{
              bgcolor: "#079447",
              "&:hover": { bgcolor: "#06783A" },
              borderRadius: 2,
              px: 3,
              py: 1.3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Create Tournament
          </Button>
        </Box>

        {/* Summary cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            {
              label: "Total Tournaments",
              value: tournaments.length,
              icon: <EmojiEventsIcon />,
            },
            {
              label: "Upcoming Events",
              value: upcomingEvents,
              icon: <CalendarMonthIcon />,
            },
            {
              label: "Registered Teams",
              value: totalTeams,
              icon: <GroupsIcon />,
            },
            {
              label: "Sports Categories",
              value: sports.length - 1,
              icon: <SportsSoccerIcon />,
            },
          ].map((stat) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.label}>
              <Card
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  boxShadow: "0 3px 15px rgba(16,29,51,0.05)",
                }}
              >
                <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Box
                    sx={{
                      bgcolor: "#DDF7E7",
                      color: "#079447",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                    }}
                  >
                    {stat.icon}
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: "#101D33" }}>
                      {stat.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search and filters */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#101D33" }}>
            All Events
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              size="small"
              placeholder="Search tournaments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ bgcolor: "white", minWidth: 230 }}
            />

            <TextField
              select
              size="small"
              label="Sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              sx={{ bgcolor: "white", minWidth: 150 }}
            >
              {sports.map((item) => (
                <MenuItem key={item} value={item}>
                  {item === "All" ? "All Sports" : item}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Tournament cards */}
        <Grid container spacing={3}>
          {filteredTournaments.map((item) => {
            const progress = Math.min(
              100,
              (item.registeredTeams / item.totalTeams) * 100
            );

            return (
              <Grid size={{ xs: 12, sm: 6, xl: 4 }} key={item.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 4px 18px rgba(16,29,51,0.07)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 28px rgba(16,29,51,0.12)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={`${item.sport} tournament`}
                      sx={{ height: 190, objectFit: "cover" }}
                    />

                    <Chip
                      label={item.status}
                      color={statusColor(item.status)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        fontWeight: 700,
                        bgcolor:
                          item.status === "Draft" ? "#E5E7EB" : undefined,
                      }}
                    />
                  </Box>

                  <CardContent
                    sx={{
                      p: 2.5,
                      display: "flex",
                      flexDirection: "column",
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "#101D33", mb: 2 }}
                    >
                      {item.name}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                      <CalendarMonthIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(item.date)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <LocationOnOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {item.venue}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                      <Chip label={item.sport} size="small" />
                      {item.ageGroups.map((age) => (
                        <Chip key={age} label={age} size="small" variant="outlined" />
                      ))}
                    </Box>

                    <Box sx={{ mt: "auto" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {item.registeredTeams} / {item.totalTeams} teams
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(progress)}%
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 5,
                          mb: 2.5,
                          bgcolor: "#E2E8F0",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "#079447",
                            borderRadius: 5,
                          },
                        }}
                      />

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/events/${item.id}`)}
                        sx={{
                          bgcolor: "#079447",
                          "&:hover": { bgcolor: "#06783A" },
                          borderRadius: 2,
                          py: 1.2,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        View Event →
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {filteredTournaments.length === 0 && (
          <Card sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No tournaments found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Try another search or select a different sport.
            </Typography>
          </Card>
        )}
      </Box>
    </Box>
  );
}
