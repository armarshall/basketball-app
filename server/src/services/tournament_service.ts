import Tournament from "../models/tournaments";
import Team from "../models/teams";

import { IRound, ITeam, ITournament, IMatch } from "../types";
import { Request, Response } from "express";

export function shuffle<T>(arr: T[]) {
  arr.sort(() => Math.random() - 0.5);
}

export const generate_tournament = (
  teams: ITeam[],
  is_teen_team: Boolean,
): ITournament => {
  const eligible_teams = teams.filter(
    (team) => team.is_teen_team === is_teen_team,
  );

  console.log("number of eligble teams: ", eligible_teams.length);
  let matches: IMatch[] = [];

  shuffle(eligible_teams);

  while (eligible_teams.length > 1) {
    let team1 = eligible_teams.pop();
    let team2 = eligible_teams.pop();

    if (!team1 || !team2) {
      break;
    }

    matches.push({
      team_ids: [team1.id, team2.id],
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
    winners.push(match.winner_id);
  });

  let new_matches: IMatch[] = [];

  for (let i = 0; i < winners.length; i += 2) {
    let new_match: IMatch = {
      team_ids: [winners[i], winners[i + 1]],
      winner_id: "",
    };

    new_matches.push(new_match);
  }

  let new_round: IRound = {
    matches: new_matches,
  };

  tournament.rounds.push(new_round);

  return true;
};

export const get_all_tounaments = async (_req: Request, res: Response) => {
  return Tournament.find({}).then((result) => {
    return res.json(result);
  });
};

export const get_tournament_by_id = async (req: Request, res: Response) => {
  return Tournament.findById(req.params.id).then((team) => {
    return res.json(team);
  });
};

export const create_tournament = (req: Request, res: Response) => {
  const body = req.body;

  if (!body) {
    return res.status(400).json({ error: "content missing" });
  }

  return Team.find({}).then((teams) => {
    const tournament_data = generate_tournament(teams, body.is_teen_team);

    const tournament = new Tournament(tournament_data);
    let error = tournament.validateSync();
    if (error) {
      return res.status(400).json(error);
    }

    return tournament.save().then((saved_tournament) => {
      return res.json(saved_tournament);
    });
  });
};
