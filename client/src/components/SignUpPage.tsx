import RegistrationForm from "./RegistrationForm";
import { Box } from "@mui/material";

interface SignUpPageProps {
  type: "guardian" | "teenager";
}

export default function SignUpPage({ type }: SignUpPageProps) {
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
