import { useState, useEffect, useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import axios from "axios";

export default function LeagueSchedule() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [teams, setTeams] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/tournaments");
        setTournaments(res.data);
      } catch (error) {
        console.error("Failed to load tournament data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        const teamIds = new Set<string>();
        for (const tournament of tournaments)
          for (const round of tournament.rounds)
            for (const match of round.matches)
              if (match.team_ids)
                for (const teamId of match.team_ids) teamIds.add(teamId);

        const teamsMap: { [key: string]: string } = {};
        for (const teamId of teamIds) {
          try {
            const res = await axios.get(
              `http://localhost:3000/api/teams/${teamId}`
            );
            teamsMap[teamId] = res.data.name;
          } catch (error) {
            console.error(`Could not find team with id: ${teamId}`, error);
            teamsMap[teamId] = teamId;
          }
        }

        setTeams(teamsMap);
      } catch (error) {
        console.error("Failed to load teams:", error);
      }
    };

    if (tournaments.length > 0) {
      fetchAllTeams();
    }
  }, [tournaments]);

  const eventData = useMemo(() => {
    const eventMap: { [key: string]: any[] } = {};

    for (const tournament of tournaments) {
      const rounds = tournament.rounds || [];
      for (const round of rounds) {
        const matches = round.matches || [];
        for (const match of matches) {
          if (!match.start_date_time) continue;

          const date = dayjs(match.start_date_time)
            .add(4, "hour")
            .format("YYYY-MM-DD");

          if (!eventMap[date]) {
            eventMap[date] = [];
          }
          eventMap[date].push(match);
        }
      }
    }

    return eventMap;
  }, [tournaments]);

  const eventDates = useMemo(() => {
    return new Set(Object.keys(eventData));
  }, [eventData]);

  const selectedDateEvents = useMemo(() => {
    const dateStr = selectedDate.format("YYYY-MM-DD");
    return eventData[dateStr] || [];
  }, [selectedDate, eventData]);

  const getTeamName = (teamId: string) => {
    return teams[teamId] || "Loading...";
  };

  const CustomDay = (props: any) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dayStr = dayjs(day).format("YYYY-MM-DD");
    const hasEvent = eventDates.has(dayStr);

    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <PickersDay
          day={day}
          outsideCurrentMonth={outsideCurrentMonth}
          {...other}
        />
        {hasEvent && (
          <span
            style={{
              position: "absolute",
              bottom: 5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#0389ffff",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "70%" }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar
            slots={{ day: CustomDay }}
            onChange={setSelectedDate}
            value={selectedDate}
          />
        </LocalizationProvider>
      </div>

      <div
        style={{ width: "30%", padding: "20px", borderLeft: "1px solid #ccc" }}
      >
        <h2>Events for {selectedDate.format("MMMM D, YYYY")}</h2>

        {selectedDateEvents.length === 0 ? (
          <p>No events on this day.</p>
        ) : (
          selectedDateEvents.map((event: any) => (
            <div key={event.id} style={{ marginBottom: "10px" }}>
              <p>
                {getTeamName(event.team_ids[0])} vs{" "}
                {getTeamName(event.team_ids[1])}
              </p>
              <p>
                Time:{" "}
                {dayjs(event.start_date_time).add(4, "hour").format("HH:mm")}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
