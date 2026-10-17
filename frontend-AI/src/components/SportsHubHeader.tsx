import {
  AppBar,
  Box,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";

import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";

export default function SportsHubHeader() {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: "#101D33" }}
    >
      <Toolbar
        sx={{
          maxWidth: 1100,
          width: "100%",
          mx: "auto",
          py: 1,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{alignItems:"center"}}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: "#079447",
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
            }}
          >
            <SportsSoccerIcon sx={{ color: "#FFFFFF" }} />
          </Box>

          <Box>
            <Typography
              variant="h6"
              
              sx={{ lineHeight: 1.1, color: "#FFFFFF", fontWeight:800 }}
            >
              SportsHub
            </Typography>

            <Typography
              variant="caption"
              sx={{ color: "#CBD5E1" }}
            >
              AI Coach Assistant
            </Typography>
          </Box>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}