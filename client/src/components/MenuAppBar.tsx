import { AppBar, Button, Toolbar } from "@mui/material";
import { get_user_data, logout } from "../services/session_service";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function MenuAppBar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = get_user_data();

    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

  const logout_and_redirect = () => {
    logout();
    navigate("/");
  };

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
        <Button
          href="/sponsors"
          color="secondary"
          sx={{ textTransform: "none" }}
        >
          Sponsors
        </Button>
        <Button href="/upload" color="secondary" sx={{ textTransform: "none" }}>
          Upload
        </Button>
        <div>
          {!user ? (
            <>
              <Button href="/signup" variant="outlined" color="secondary">
                Sign Up
              </Button>
              <Button href="/login" variant="outlined" color="secondary">
                Log In
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={logout_and_redirect}
                variant="outlined"
                color="secondary"
              >
                Sign Out
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}
