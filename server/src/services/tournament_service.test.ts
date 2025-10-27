import { describe, expect, test } from "@jest/globals";
import { ITeam } from "../types";
import {
  generate_next_round,
  generate_tournament,
  shuffle,
} from "./tournament_service";

describe("tournament controller", () => {
  test("generate a tournament", () => {
    const team1: ITeam = {
      name: "team 1",
      id: "1",
      players: [],
      is_teen_team: true,
    };

    const team2: ITeam = {
      name: "team 2",
      id: "1",
      players: [],
      is_teen_team: true,
    };

    const tournament = generate_tournament([team1, team2], true);
    expect(tournament.is_teen_tournament).toBe(true);
    expect(tournament.rounds.length).toBe(1);
  });

  test("test pick a random item", () => {
    const nums = [1, 2, 3];
    shuffle(nums);

    expect(nums.length).toBe(3);
  });

  test("generate multiple matches", () => {
    const team1: ITeam = {
      name: "team 1",
      id: "1",
      players: [],
      is_teen_team: true,
    };

    const team2: ITeam = {
      name: "team 2",
      id: "2",
      players: [],
      is_teen_team: true,
    };

    const team3: ITeam = {
      name: "team 2",
      id: "3",
      players: [],
      is_teen_team: true,
    };

    const team4: ITeam = {
      name: "team 2",
      id: "4",
      players: [],
      is_teen_team: true,
    };

    const tournament = generate_tournament([team1, team2, team3, team4], true);

    console.log(tournament);
    console.log(tournament.rounds[0].matches);

    expect(tournament.is_teen_tournament).toBe(true);
    expect(tournament.rounds.length).toBe(1);
    expect(tournament.rounds[0].matches.length).toBe(2);
    expect(tournament.rounds[0].matches[0].team_ids[0]).not.toBe(
      tournament.rounds[0].matches[0].team_ids[1],
    );
    expect(tournament.rounds[0].matches[1].team_ids[0]).not.toBe(
      tournament.rounds[0].matches[1].team_ids[1],
    );
  });

  test("simulate a next round", () => {
    const team1: ITeam = {
      name: "team 1",
      id: "1",
      players: [],
      is_teen_team: true,
    };

    const team2: ITeam = {
      name: "team 2",
      id: "2",
      players: [],
      is_teen_team: true,
    };

    const team3: ITeam = {
      name: "team 2",
      id: "3",
      players: [],
      is_teen_team: true,
    };

    const team4: ITeam = {
      name: "team 2",
      id: "4",
      players: [],
      is_teen_team: true,
    };

    let tournament = generate_tournament([team1, team2, team3, team4], true);

    tournament.rounds[0].matches[0].winner_id =
      tournament.rounds[0].matches[0].team_ids[0];
    tournament.rounds[0].matches[1].winner_id =
      tournament.rounds[0].matches[0].team_ids[0];

    const success = generate_next_round(tournament);

    expect(success).toBeTruthy();
    expect(tournament.rounds.length).toBe(2);
    expect(tournament.rounds[1].matches.length).toBe(1);
  });
});
