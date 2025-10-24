import { Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import ChildForm from "./ChildForm";

interface RegistrationFormProps {
  type: "guardian" | "teenager" | "child";
}

export default function RegistrationForm({ type }: RegistrationFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    email: "",
    password: "",
    confirmPassword: "",
    guardianId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async () => {
    // Basic validation for all types
    if (type === "child") {
      if (!formData.name || !formData.dateOfBirth) {
        setError("Please fill in all required fields");
        return;
      }
    } else {
      if (
        !formData.name ||
        !formData.dateOfBirth ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill in all required fields");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Determine the correct endpoint based on registration type
      const endpoint =
        type === "teenager"
          ? "http://localhost:3000/api/teenagers"
          : type === "child"
          ? "http://localhost:3000/api/children"
          : "http://localhost:3000/api/guardians";

      const requestData =
        type === "child"
          ? {
              name: formData.name,
              dateOfBirth: formData.dateOfBirth,
              guardianId: formData.guardianId || "temp-guardian-id", // TODO: Implement proper authentication/session management
            }
          : {
              name: formData.name,
              dateOfBirth: formData.dateOfBirth,
              email: formData.email,
              password: formData.password,
            };

      const response = await axios.post(endpoint, requestData);
      console.log("Registration successful:", response.data);
      // Handle successful registration (redirect, show success message, etc.)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (type === "guardian") {
      // For guardians, submit their data first, then proceed to child form
      await handleSubmit();
      if (!error) {
        setStep(2);
      }
    } else {
      handleSubmit();
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
        <TextField
          label="Name"
          required
          value={formData.name}
          onChange={handleInputChange("name")}
        />
        <TextField
          label="Date of Birth"
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={handleInputChange("dateOfBirth")}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        {type === "child" && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 1 }}
          >
            Note: This child will be linked to the guardian who is currently
            logged in.
          </Typography>
        )}
        {type !== "child" && (
          <>
            <TextField
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange("email")}
            />
            <TextField
              label="Password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange("password")}
            />
            <TextField
              label="Confirm Password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
            />
          </>
        )}
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : getButtonText()}
        </Button>
      </Box>
    </>
  );
}
