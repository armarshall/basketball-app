import { TextField, Button, Typography } from "@mui/material";
import FormContainer from "./FormContainer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/material";
import { login } from "../services/session_service";

export default function LogInForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (): Promise<boolean> => {
    if (!formData.email || !formData.password) {
      // Enforce input for email and password
      setError("Please fill in all required fields");
      return false;
    } else {
      // Check if password matches database hash
      const logged_in = await login(formData.email, formData.password);

      if (!logged_in) {
        setError("Email or password is incorrect");
        return false;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Navigate immediately to home and show snackbar there
      navigate("/", { state: { snackbarMessage: "Log in successful!" } });

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Log in failed");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 64px)",
      }}
    >
      <FormContainer title={"Log In"}>
        <TextField
          label="Email"
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
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </FormContainer>
    </Box>
  );
}
