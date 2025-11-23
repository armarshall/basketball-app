import { describe, expect, test, jest } from "@jest/globals";

import { ITeam } from "../types";
import {
  create_tournament,
  generate_tournament,
  //get_tournament_by_id,
  //get_all_tournaments,
  shuffle,
} from "./tournament_controller";
import Tournament from "../models/tournaments";
import Team from "../models/teams";
import Match from "../models/matches";
import Round from "../models/rounds";
import { ObjectId } from "mongodb";

describe("tournament controller", () => {
  test("generate a tournament", async () => {
    const team1: ITeam = {
      name: "team 1",
      id: new ObjectId().toHexString(),
      players: [],
      is_teen_team: true,
    } as any;

    const team2: ITeam = {
      name: "team 2",
      id: new ObjectId().toHexString(),
      players: [],
      is_teen_team: true,
    } as any;

    const week_of = new Date();

    const tournamentCreateSpy = jest.spyOn(Tournament, "create");
    const roundCreateSpy = jest.spyOn(Round, "create");
    const matchCreateSpy = jest.spyOn(Match, "create");

    await generate_tournament([team1, team2], week_of, true);

    expect(tournamentCreateSpy).toHaveBeenCalled();
    expect(roundCreateSpy).toHaveBeenCalled();
    expect(matchCreateSpy).toHaveBeenCalled();

    tournamentCreateSpy.mockRestore();
    roundCreateSpy.mockRestore();
    matchCreateSpy.mockRestore();
  });

  test("test pick a random item", () => {
    const nums = [1, 2, 3];
    shuffle(nums);

    expect(nums.length).toBe(3);
  });

  test("generate multiple matches", async () => {
    const team1: ITeam = {
      name: "team 1",
      id: new ObjectId().toHexString(),
      players: [],
      is_teen_team: true,
    } as any;

    const team2: ITeam = {
      name: "team 2",
      id: new ObjectId().toHexString(),
      players: [],
      is_teen_team: true,
    } as any;

    const team3: ITeam = {
      name: "team 3",
      id: new ObjectId().toHexString(),
      players: [],
      is_teen_team: true,
    } as any;

    const team4: ITeam = {
      name: "team 4",
      id: new ObjectId().toHexString(),
      players: [],
      is_teen_team: true,
    } as any;

    const week_of = new Date();

    const tournamentCreateSpy = jest.spyOn(Tournament, "create");
    const roundCreateSpy = jest.spyOn(Round, "create");
    const matchCreateSpy = jest.spyOn(Match, "create");

    await generate_tournament([team1, team2, team3, team4], week_of, true);

    expect(tournamentCreateSpy).toHaveBeenCalled();
    expect(roundCreateSpy).toHaveBeenCalled();
    expect(matchCreateSpy).toHaveBeenCalledTimes(2);

    tournamentCreateSpy.mockRestore();
    roundCreateSpy.mockRestore();
    matchCreateSpy.mockRestore();
  });

  test("create_tournament: should return an error if content is missing", async () => {
    const req = {
      body: null,
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await create_tournament(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "content missing" });
  });

  test("create_tournament: should create a tournament successfully", async () => {
    const req = {
      body: {
        week_of: new Date().toISOString(),
        is_teen_team: true,
      },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    jest.spyOn(Team, "find").mockResolvedValue([
      {
        _id: new ObjectId(),
        name: "Team 1",
        players: [],
        is_teen_team: true,
      },
    ]);
    jest.spyOn(Tournament.prototype, "save").mockImplementation(async () => {
      return {} as any;
    });
    jest.spyOn(Tournament.prototype, "validateSync").mockReturnValue(null);

    await create_tournament(req, res);

    expect(res.json).toHaveBeenCalled();
  });
});
