import { Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import ChildForm from "./ChildForm";

interface RegistrationFormProps {
  type: "guardian" | "teenager" | "child";
}

export default function RegistrationForm({ type }: RegistrationFormProps) {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (type === "guardian") {
      setStep(2);
    }
  };

  if (type === "guardian" && step === 2) {
    return <ChildForm />;
  }

  const getTitle = () => {
    if (type === "guardian") return "Guardian Sign Up";
    if (type === "teenager") return "Teenager Sign Up";
    if (type === "child") return "Child Information";
    return "";
  };

  const getButtonText = () => {
    if (type === "guardian") return "Next Page";
    return "Submit";
  };

  return (
    <>
      <Typography gutterBottom variant="h4">
        {getTitle()}
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
        {type !== "child" && (
          <>
            <TextField label="Email" type="email" required />
            <TextField label="Password" type="password" required />
            <TextField label="Confirm Password" type="password" required />
          </>
        )}
        <Button variant="contained" onClick={handleNext}>
          {getButtonText()}
        </Button>
      </Box>
    </>
  );
}
