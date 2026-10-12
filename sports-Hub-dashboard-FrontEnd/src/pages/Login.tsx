import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
      }}
    >
      <Card sx={{ width: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Sports Event Manager
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Organiser Portal
          </Typography>

          <TextField
            fullWidth
            label="Email"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}