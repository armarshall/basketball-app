import RegistrationForm from "./RegistrationForm";
import { Box } from "@mui/material";

interface SignUpFormProps {
  type: "guardian" | "teenager";
}

export default function SignUpForm({ type }: SignUpFormProps) {
  return (
    <Box
      component="div"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 64px)",
      }}
    >
      <RegistrationForm type={type} />
    </Box>
  );
}
