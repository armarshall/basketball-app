import { StatsUpdater } from "../components/StatsEditor";

export const StatsEditorPage = () => {
  return (
    <>
      <h1>Stats Editor</h1>
      <StatsUpdater
        player_id="68fb087e0744adc9e0e4f107"
        is_teen={false}
        game_id="0"
      />
    </>
  );
};
