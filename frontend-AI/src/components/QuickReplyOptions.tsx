import { Box, Button } from "@mui/material";
import type { QuickReply } from "../types/chat";

interface Props {
  options: QuickReply[];
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function QuickReplyOptions({
  options,
  onSelect,
  disabled = false,
}: Props) {
  if (options.length === 0) return null;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        mt: 2,
      }}
    >
      {options.map((option) => (
        <Button
          key={option.value}
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={() => onSelect(option.value)}
          sx={{
            borderRadius: 5,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#B5D6C9",
            color: "#176B54",
            bgcolor: "#FFFFFF",
            px: 2,
            "&:hover": {
              bgcolor: "#E6F4ED",
              borderColor: "#176B54",
            },
          }}
        >
          {option.label}
        </Button>
      ))}
    </Box>
  );
}