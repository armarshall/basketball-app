import { Button } from "@mui/material";

export default function SignUp() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <h1>I am a...</h1>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <Button href="/signup/guardian" variant="contained">
          Guardian
        </Button>
        <Button href="/signup/teenager" variant="contained">
          Teenager
        </Button>
      </div>
      <h3>If you are under the age of 13, a guardian must sign up for you.</h3>
    </div>
  );
}
