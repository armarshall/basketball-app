import { IRound, ITeam, ITournament, IMatch } from "../types";

function _random_item<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Gets the next Saturday of the given date
 * date:    date to find the next Saturday for
 * return:  1 Saturday from date 
*/
function getNextSaturday(date: Date): Date {
  // 0 = Sunday, 6 = Saturday
  const currentDay = date.getDay();

  // If today is Saturday, schedule for next Saturday
  const daysUntilSaturday = currentDay != 6 ? 6 - currentDay : 7;

  // Return next saturday's date
  return new Date(date.getDate() + daysUntilSaturday);
}

export const generate_tournament = (
  teams: ITeam[],
  week_of: Date, 
  is_teen_team: Boolean,
): ITournament => {
  const eligible_teams = teams.filter((teams) => {
    teams.is_teen_team == is_teen_team;
  });

  let matches: IMatch[] = [];
  let match_time: Date = getNextSaturday(week_of);

  for (let i = 0; i < eligible_teams.length; i += 2) {
    let team1_id = _random_item(eligible_teams).id;
    let team2_id = _random_item(eligible_teams).id;

    matches.concat({
      team_ids: [team1_id, team2_id],
      start_date_time: match_time,
      scores: [-1, -1],
      winner_id: "",
    });

    match_time = getNextSaturday(match_time);
  }

  let first_round: IRound = { matches };

  return { id: "", start_date_time: week_of, rounds: [first_round], is_teen_tournament: is_teen_team };
};

export const generate_next_round = (tournament: ITournament): Boolean => {
  if (!tournament.rounds || tournament.rounds.length == 0) {
    return false;
  }

  const last_round_num = tournament.rounds.length - 1;
  const last_round = tournament.rounds[last_round_num];

  let winners = [] as String[];

  last_round.matches.forEach((match) => {
    if (match.winner_id) {
      winners.push(match.winner_id);
    }
  });

  let new_matches: IMatch[] = [];
  let match_time: Date = getNextSaturday(new Date());

  for (let i = 0; i < winners.length; i += 2) {
    let new_match: IMatch = {
      team_ids: [winners[i], winners[i + 1]],
      start_date_time: match_time,
      scores: [-1, -1],
      winner_id: "",
    };

    new_matches.concat(new_match);
    match_time = getNextSaturday(match_time);
  }

  let new_round: IRound = {
    matches: new_matches,
  };

  tournament.rounds.concat(new_round);

  return true;
};
