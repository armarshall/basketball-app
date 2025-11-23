import { describe, expect, test, jest } from "@jest/globals";

import { ITeam } from "../types";
import {
  generate_next_round,
  generate_tournament,
  get_all_tournaments,
  get_tournament_by_id,
  shuffle,
} from "./tournament_controller";

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

    const tournament = generate_tournament([team1, team2], new Date(), true);
    expect(tournament.is_teen_tournament).toBe(true);
    expect(tournament.round_ids.length).toBe(1);
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

    const tournament = generate_tournament(
      [team1, team2, team3, team4],
      new Date(),
      true,
    );

    console.log(tournament);
    console.log(tournament.round_ids[0].matches);

    expect(tournament.is_teen_tournament).toBe(true);
    expect(tournament.round_ids.length).toBe(1);
    expect(tournament.round_ids[0].matches.length).toBe(2);
    expect(tournament.round_ids[0].matches[0].team_ids[0]).not.toBe(
      tournament.round_ids[0].matches[0].team_ids[1],
    );
    expect(tournament.round_ids[0].matches[1].team_ids[0]).not.toBe(
      tournament.round_ids[0].matches[1].team_ids[1],
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

    let tournament = generate_tournament(
      [team1, team2, team3, team4],
      new Date(),
      true,
    );

    tournament.round_ids[0].matches[0].winner_id =
      tournament.round_ids[0].matches[0].team_ids[0];
    tournament.round_ids[0].matches[1].winner_id =
      tournament.round_ids[0].matches[0].team_ids[0];

    const success = generate_next_round(tournament);

    expect(success).toBeTruthy();
    expect(tournament.round_ids.length).toBe(2);
    expect(tournament.round_ids[1].matches.length).toBe(1);
  });

  test(
    "get all tournaments",
    async () => {
      const req = {} as any;

      const mock_json = jest.fn();

      const res = {
        json: mock_json,
      } as any;

      const all_tournaments = await get_all_tounaments(req, res);
      console.log(all_tournaments);
      expect(mock_json).toHaveBeenCalled();
    },
    5 * 1000,
  );

  test("get a tournament by id", async () => {
    const req = {
      params: {
        id: "68f987913d5f14172215bc36" as String,
      },
    } as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    const all_tournaments = await get_tournament_by_id(req, res);
    console.log(all_tournaments);
    expect(mock_json).toHaveBeenCalled();
  });
});
