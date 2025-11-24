import { AppBar, Button, Toolbar } from "@mui/material";
import { get_user_data, logout } from "../services/session_service";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  isManager?: boolean;
  managedTeamId?: string;
  isAdmin?: boolean;
  type?: "guardian" | "teen";
}

export default function MenuAppBar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = get_user_data();
    setUser(userData ? JSON.parse(userData) : null);
  }, [location]);

  const handleSignOut = () => {
    logout();
    setUser(null);
    navigate("/");
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
          
          {/* Teams Link - Show to ALL users (logged in or not) */}
          <Button href="/teams" color="secondary" sx={{ textTransform: "none" }}>
            Browse Teams
          </Button>
          
          {/* Manager Links - Only show if user is a manager */}
          {user?.isManager && (
            <Button href="/manager-profile" color="secondary" sx={{ textTransform: "none" }}>
              Manager Dashboard
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