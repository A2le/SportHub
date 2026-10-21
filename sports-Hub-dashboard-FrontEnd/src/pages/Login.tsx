import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#079447" },
    "&.Mui-focused fieldset": { borderColor: "#079447" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#079447" },
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F3F6FA",
      }}
    >
      <Card
        sx={{
          width: 420,
          borderRadius: 4,
          boxShadow: "0 8px 40px rgba(16,29,51,0.12)",
          overflow: "hidden",
        }}
      >
        {/* Green header */}
        <Box
          sx={{
            bgcolor: "#079447",
            py: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              p: 1.5,
              display: "flex",
            }}
          >
            <SportsSoccerIcon sx={{ fontSize: 36, color: "white" }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "white", letterSpacing: 0.5 }}>
            SportHub
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
            Organiser Portal
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#101D33", mb: 0.5 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to manage your tournaments
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#079447", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ ...fieldSx, mb: 2 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#079447", fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate("/dashboard")}
            sx={{
              mt: 3,
              bgcolor: "#079447",
              "&:hover": { bgcolor: "#06783A" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 16,
              py: 1.4,
            }}
          >
            Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
