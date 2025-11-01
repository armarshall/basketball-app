import { Box, Typography } from "@mui/material";
import type { PropsWithChildren, ReactNode } from "react";

interface FormContainerProps {
  title?: ReactNode;
}

export default function FormContainer({
  title,
  children,
}: PropsWithChildren<FormContainerProps>) {
  return (
    <>
      {title && (
        <Typography gutterBottom variant="h4">
          {title}
        </Typography>
      )}
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
        {children}
      </Box>
    </>
  );
}
