import { AppBar, Button, Toolbar } from "@mui/material";
import { get_user_data, logout } from "../services/log_in_service";

export default function MenuAppBar() {
  const userData = get_user_data();
  const user = userData ? JSON.parse(userData) : null;

  const handleSignOut = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Navigation Links */}
        <div>
          <Button href="/" color="secondary" sx={{ textTransform: "none" }}>
            Home
          </Button>
          <Button href="/rules" color="secondary" sx={{ textTransform: "none" }}>
            Rules
          </Button>
          <Button href="/team" color="secondary" sx={{ textTransform: "none" }}>
            Team
          </Button>
          <Button href="/standings" color="secondary" sx={{ textTransform: "none" }}>
            Standings
          </Button>
          <Button href="/about" color="secondary" sx={{ textTransform: "none" }}>
            About
          </Button>
          <Button href="/sponsors" color="secondary" sx={{ textTransform: "none" }}>
            Sponsors
          </Button>
          <Button href="/upload" color="secondary" sx={{ textTransform: "none" }}>
            Upload
          </Button>
          {/* Manage Team Link - Only show if user is a manager */}
          {user?.isManager && (
            <Button href="/manageteam" color="secondary" sx={{ textTransform: "none" }}>
              Manage Team
            </Button>
          )}
        </div>

        {/* Auth Buttons */}
        <div>
          {user ? (
            // Show when user is logged in
            <>
              <Button 
                color="secondary" 
                sx={{ textTransform: "none", mr: 1 }}
              >
                Hello, {user.name}
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            // Show when user is logged out
            <>
              <Button href="/signup" variant="outlined" color="secondary" sx={{ mr: 1 }}>
                Sign Up
              </Button>
              <Button href="/login" variant="outlined" color="secondary">
                Log In
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
}