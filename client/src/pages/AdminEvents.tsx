import React from "react";
import EventsTable from "../components/EventsTable";

const Events: React.FC = () => {
  return (
    <div>
      <h1 style={{ margin: "20px" }}>Events</h1>
      <EventsTable />
    </div>
  );
};

export default Events;
