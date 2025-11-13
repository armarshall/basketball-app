import React from "react";
import EventsTable from "../components/EventsTable";

interface Event {
  id: number;
  team1: string;
  team2: string;
  date: string;
  time: string;
}

const Events: React.FC = () => {
  // Placeholder for events data
  const eventsData: Event[] = [
    {
      id: 1,
      team1: "Team A",
      team2: "Team B",
      date: "2024-01-01",
      time: "10:00",
    },
    {
      id: 2,
      team1: "Team C",
      team2: "Team D",
      date: "2024-01-02",
      time: "11:00",
    },
  ];

  return (
    <div>
      <h1 style={{ margin: "20px" }}>Events</h1>
      <EventsTable events={eventsData} />
    </div>
  );
};

export default Events;
