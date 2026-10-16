import { Button, Stack } from "@mui/material";

import CheckCircleOutlineIcon from
  "@mui/icons-material/CheckCircleOutlined";

import CloseIcon from "@mui/icons-material/Close";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function RegistrationActions({
  onConfirm,
  onCancel,
  disabled = false,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{
        ml: { xs: 0, sm: 6 },
        mt: 1,
        mb: 3,
      }}
    >
      <Button
        variant="contained"
        startIcon={<CheckCircleOutlineIcon />}
        onClick={onConfirm}
        disabled={disabled}
        sx={{
          bgcolor: "#176B54",
          borderRadius: 2,
          py: 1.2,
          px: 3,
          textTransform: "none",
          fontWeight: 700,
          "&:hover": {
            bgcolor: "#11503F",
          },
        }}
      >
        Confirm Registration
      </Button>

      <Button
        variant="outlined"
        color="inherit"
        startIcon={<CloseIcon />}
        onClick={onCancel}
        disabled={disabled}
        sx={{
          borderRadius: 2,
          py: 1.2,
          px: 3,
          textTransform: "none",
        }}
      >
        Cancel
      </Button>
    </Stack>
  );
}