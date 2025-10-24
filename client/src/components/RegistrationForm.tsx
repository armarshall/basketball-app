import { Box, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import ChildForm from "./ChildForm";

// Utility function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

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

  const handleSubmit = async (): Promise<boolean> => {
    // Basic validation for all types
    if (type === "child") {
      if (!formData.name || !formData.dateOfBirth) {
        setError("Please fill in all required fields");
        return false;
      }
    } else {
      if (
        !formData.name ||
        !formData.dateOfBirth ||
        !formData.email ||
        !formData.password
      ) {
        setError("Please fill in all required fields");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }

    // Age validation based on user type
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);

      if (type === "guardian" && age < 18) {
        setError("Guardians must be 18 years or older to sign up");
        return false;
      }

      if (type === "teenager" && age < 13) {
        setError("Teenagers must be 13 years or older to sign up");
        return false;
      }

      if (type === "child" && age > 12) {
        setError("Children must be 12 years or under to sign up");
        return false;
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
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (type === "guardian") {
      // For guardians, submit their data first, then proceed to child form
      const success = await handleSubmit();
      if (success) {
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
