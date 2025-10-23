import { IRound, ITeam, ITournament, IMatch } from "../types";

function _random_item<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const generate_tournament = (
  teams: ITeam[],
  is_teen_team: Boolean,
): ITournament => {
  const eligible_teams = teams.filter((teams) => {
    teams.is_teen_team == is_teen_team;
  });

  let matches: IMatch[] = [];

  for (let i = 0; i < eligible_teams.length; i += 2) {
    let team1_id = _random_item(eligible_teams).id;
    let team2_id = _random_item(eligible_teams).id;

    matches.concat({
      team_ids: [team1_id, team2_id],
      winner_id: "",
    });
  }

  let first_round: IRound = { matches };

  return { id: "", rounds: [first_round], is_teen_tournament: is_teen_team };
};

export const generate_next_round = (tournament: ITournament): Boolean => {
  if (!tournament.rounds || tournament.rounds.length == 0) {
    return false;
  }

  const last_round_num = tournament.rounds.length - 1;
  const last_round = tournament.rounds[last_round_num];

  let winners = [] as String[];

  last_round.matches.forEach((match) => {
    winners.concat(match.winner_id);
  });

  let new_matches: IMatch[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    let new_match: IMatch = {
      team_ids: [winners[i], winners[i + 1]],
      winner_id: "",
    };

    new_matches.concat(new_match);
  }

  let new_round: IRound = {
    matches: new_matches,
  };

  tournament.rounds.concat(new_round);

  return true;
};
