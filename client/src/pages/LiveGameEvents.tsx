import { LiveGameEventsViewer } from "../components/LiveGameEventsViewer";

export const LiveGameEventsPage = () => {
  return (
    <>
      <h1>Live Game Events</h1>
      <LiveGameEventsViewer
        game_id="691ce60129bbf1e5a98a3c89"
        is_teen_team={false}
      />
    </>
  );
};
