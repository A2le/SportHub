import { Card, CardContent, Typography } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}