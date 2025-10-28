import LeagueSchedule from "../components/LeagueSchedule";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AppSnackbar from "../components/AppSnackbar";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { snackbarMessage?: string } | null;
    if (state?.snackbarMessage) {
      setSnackbarMessage(state.snackbarMessage);
      setOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>Welcome to the Baltimore Basketball League</h1>
      <p>Your home for all things basketball in Baltimore!</p>
      <AppSnackbar
        open={open}
        message={snackbarMessage ?? ""}
        severity="success"
        onClose={() => setOpen(false)}
      />
      <LeagueSchedule />
    </div>
  );
}
