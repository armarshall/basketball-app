import { Box, TextField, Button, Typography } from "@mui/material";

interface RegistrationFormProps {
  type: "guardian" | "teenager";
}

export default function RegistrationForm({ type }: RegistrationFormProps) {
  return (
    <>
      <Typography gutterBottom variant="h4">
        {type === "guardian" ? "Guardian Sign Up" : "Teenager Sign Up"}
      </Typography>
      <Box
        component="form"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          maxWidth: "500px",
          width: "100%",
          padding: "20px",
          "& .MuiTextField-root": { m: 0.5, width: "100%", maxWidth: "300px" },
          "& .MuiButton-root": { m: 0.5, width: "100%", maxWidth: "300px" },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField label="Name" required />
        <TextField
          label="Date of Birth"
          type="date"
          required
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField label="Email" type="email" required />
        <TextField label="Password" type="password" required />
        <TextField label="Confirm Password" type="password" required />
        <Button variant="contained" type="submit">
          Submit
        </Button>
      </Box>
    </>
  );
}
