import React, { useEffect, useState } from "react";
import EventsTable from "../components/EventsTable";
import { Button } from "@mui/material";

const AdminEvents: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error parsing user from session storage:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, []);

  if (!isAdmin) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ margin: "20px" }}>Events</h1>
      <EventsTable />
      <hr />
      <h1 style={{ margin: "20px" }}>Editors</h1>
      <Button href="/stats-viewer" variant="contained">
        Stats Viewer
      </Button>
      <Button href="/stats-editor" variant="contained">
        Stats Editor
      </Button>
      <Button href="/live-game-events" variant="contained">
        Live Events Editor
      </Button>
    </div>
  );
};

export default AdminEvents;
