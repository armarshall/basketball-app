import Tournament from "../models/tournaments";
import Team from "../models/teams";
import Match from "../models/matches";
import Round from "../models/rounds";
import { ObjectId } from "mongodb";
//import { get_rounds_by_tournament_id } from "../services/round_service";

import { ITeam } from "../types";
import { Request, Response } from "express";

export function shuffle<T>(arr: T[]) {
  arr.sort(() => Math.random() - 0.5);
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

export const generate_tournament = async (
  teams: ITeam[],
  week_of: Date,
  is_teen_team: boolean,
) => {
  const eligible_teams = teams.filter(
    (team) => team.is_teen_team === is_teen_team,
  );

  console.log("number of eligble teams: ", eligible_teams.length);
  let match_time: Date = getNextSaturday(week_of);

  shuffle(eligible_teams);

  let tournament = {
    _id: new ObjectId(),
    week_of: week_of,
    is_teen_team: is_teen_team,
    round_ids: [],
  };

  let first_round = {
    _id: new ObjectId(),
    tournament_id: tournament._id,
    match_ids: [],
  };

  //tournament.round_ids.push(first_round._id);

  const newTournament = await Tournament.create(tournament);
  const newRound = await Round.create(first_round);

  while (eligible_teams.length > 1) {
    let team1 = eligible_teams.pop();
    let team2 = eligible_teams.pop();

    if (!team1 || !team2) {
      break;
    }

    const match = {
      _id: new ObjectId(),
      team1_id: team1.id,
      team2_id: team2.id,
      start_date_time: match_time,
      team1_score: 0,
      team2_score: 0,
      winner_id: "",
    };

    const newMatch = await Match.create(match);
    console.log("Created match:", newMatch);

    match_time = getNextSaturday(match_time);
  }

  await Promise.all([newTournament.save(), newRound.save()]);
};
/*
export const generate_next_round = (tournament_id: string): boolean => {
  const rounds = get_rounds_by_tournament_id(tournament_id);
  if (!rounds || rounds.length == 0) {
    return false;
  }

  const last_round_num = rounds.length - 1;
  const last_round = rounds[last_round_num];

  let winners = [] as string[];

  last_round.matches.forEach((match) => {
    if (match.winner_id) {
      winners.push(match.winner_id);
    }
  });

  let matches = [];
  let match_time: Date = getNextSaturday(new Date());

  for (let i = 0; i < winners.length; i += 2) {
    let match: IMatch = {
      team1_id: winners[i],
      team2_id: winners[i + 1],
      start_date_time: match_time,
      team1_score: 0,
      team2_score: 0,
      winner_id: "",
    };

    matches.push(match);
    match_time = getNextSaturday(match_time);
  }

  const matches = await Promise.all(matchPromises);
  const match_ids = matches.map((match) => match.id);

  let new_round: IRound = {
    match_ids: new_matches,
  };

  rounds.push(new_round);

  return true;
};
*/
export const get_all_tournaments = async (_req: Request, res: Response) => {
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
    const tournament_data = generate_tournament(
      teams,
      new Date(body.week_of),
      body.is_teen_team,
    );

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
