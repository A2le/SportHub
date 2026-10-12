
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useLocation, useNavigate } from "react-router-dom";

const NAVY = "#101D33";
const GREEN = "#079447";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "Create Event",
      path: "/create-event",
      icon: <AddCircleIcon />,
    },
    {
      label: "Teams",
      path: "/teams",
      icon: <GroupsIcon />,
    },
    {
      label: "Fixtures",
      path: "/fixtures",
      icon: <CalendarMonthIcon />,
    },
  ];

  return (
    <Box
      component="aside"
      sx={{
        width: "240px",
        minWidth: "240px",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1200,
        bgcolor: NAVY,
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 3, py: 3, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: GREEN,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            S
          </Box>

          <Typography
            variant="h6"
            sx={{ color: "#FFFFFF", letterSpacing: 0.3, fontWeight: 800 }}
          >
            SportsHub
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{ color: "#AAB8CB", pl: 0.5 }}
        >
          Organiser Portal
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 0 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 1,
                minHeight: 48,
                borderRadius: 2,
                color: active ? "#FFFFFF" : "#CBD5E1",
                borderLeft: active
                  ? `4px solid ${GREEN}`
                  : "4px solid transparent",
                bgcolor: active ? "rgba(7,148,71,0.20)" : "transparent",
                "&.Mui-selected": {
                  bgcolor: "rgba(7,148,71,0.20)",
                  color: "#FFFFFF",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "rgba(7,148,71,0.30)",
                },
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.07)",
                  color: "#FFFFFF",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: active ? "#35D879" : "inherit",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          p: 2.5,
          borderTop: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: "#AAB8CB" }}
        >
          SPORTS EVENT MANAGEMENT
        </Typography>
      </Box>
    </Box>
  );
}
