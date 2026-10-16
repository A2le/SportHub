import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import type { Registration } from "../types/chat";

interface Props {
  registration: Registration;
}

export default function RegistrationSummary({
  registration,
}: Props) {
  const fields = [
    { label: "Team Name", value: registration.teamName },
    { label: "School", value: registration.schoolName },
    { label: "Coach", value: registration.coachName },
    { label: "Phone", value: registration.coachPhone },
    { label: "Age Group", value: registration.ageGroup },
    { label: "Division", value: registration.division },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2,
        p: 2.5,
        borderRadius: 3,
        bgcolor: "#FFFFFF",
        color: "#1C2935",
        border: "1px solid #E3E8EF",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:1}}
          
          
        >
          <Stack direction="row" sx={{alignItems:"center"}} spacing={1}>
            <GroupsOutlinedIcon sx={{ color: "#176B54" }} />

            <Typography variant="subtitle1" sx={{fontWeight:700}}>
              Registration Details
            </Typography>
          </Stack>

          <Chip
            label="Review"
            color="warning"
            size="small"
            variant="outlined"
          />
        </Stack>

        <Divider />

        <Grid container spacing={2}>
          {fields.map((field) => (
            <Grid size={{ xs: 12, sm: 6 }} key={field.label}>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {field.label}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ overflowWrap: "anywhere", mt: 0.5, fontWeight:600 }}
                >
                  {field.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider />

        <Typography variant="caption" color="text.secondary">
          Event ID: {registration.eventId}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Please verify these details before registering.
        </Typography>
      </Stack>
    </Paper>
  );
}