import { useState, useEffect, useMemo } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import axios from 'axios';

export default function LeagueSchedule() {
  // Saves component state
  const [tournaments, setTournaments] = useState<any[]>([]);

  // Execute when component loads on the page
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        // Get database tournament data from api (setup in tournament_router.ts)
        const res = await axios.get('http://localhost:3000/api/tournaments');
        setTournaments(res.data);
      } catch (e) {
        console.error('Failed to load tournaments:', e);
      }
    };
    fetchTournaments();
  }, []);

  // Create a set of date strings (YYYY-MM-DD) that have >= 1 match
  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    for (const tournament of tournaments) {
      // Iterate through each of the rounds
      for (const round of tournament.rounds) {
        // Iterate through each match in the tournament
        for (const match of round.matches) {
          // Check if the start_date_time field exists
          const start_date_time = match.start_date_time ?? null;
          if (!start_date_time) continue;
          // Add 4 hours to convert to EDT
          const date = dayjs(start_date_time).add(4, "hour").format('YYYY-MM-DD');
          dates.add(date);
        }
      }
    }
    return dates;
  }, [tournaments]);

  // Custom day that adds a small dot when there's an event on that day
  const CustomDay = (props: any) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dayStr = dayjs(day).format('YYYY-MM-DD');
    const hasEvent = eventDates.has(dayStr);

    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <PickersDay day={day} outsideCurrentMonth={outsideCurrentMonth} {...other} />
        {hasEvent && (
          <span
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 5,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#0389ffff',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateCalendar slots={{ day: CustomDay }} />
      </LocalizationProvider>
    </div>
  );
}