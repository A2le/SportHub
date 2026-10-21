import { useAuth } from "react-oidc-context";
import { Box, Button, CircularProgress } from "@mui/material";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <Box sx={{ textAlign: "center", p: 5 }}>
        <h2>Welcome to SportsHub</h2>

        <Button
          variant="contained"
          onClick={() => void auth.signinRedirect()}
        >
          Sign In
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}