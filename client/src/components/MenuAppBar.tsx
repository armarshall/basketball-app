import { AppBar, Button, Toolbar } from "@mui/material";

export default function MenuAppBar() {
  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Button href="/" color="secondary" sx={{ textTransform: "none" }}>
          Home
        </Button>
        <Button href="/rules" color="secondary" sx={{ textTransform: "none" }}>
          Rules
        </Button>
        <Button href="/team" color="secondary" sx={{ textTransform: "none" }}>
          Team
        </Button>
        <Button
          href="/standings"
          color="secondary"
          sx={{ textTransform: "none" }}
        >
          Standings
        </Button>
        <Button href="/about" color="secondary" sx={{ textTransform: "none" }}>
          About
        </Button>
        <Button href="/sponsors" color="secondary" sx={{ textTransform: "none" }}>
          Sponsors
        </Button>
        <Button href="/signup" variant="outlined" color="secondary">
          Sign Up
        </Button>
        <Button href="/login" variant="outlined" color="secondary">
          Log In
        </Button>
      </Toolbar>
    </AppBar>
  );
}