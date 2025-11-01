import { describe, expect, test, jest, beforeEach } from "@jest/globals";

import {
  create_team,
  get_all_teams,
  get_team_by_id,
  update_team_players,
  get_team_players,
} from "./team_controller";
import Team from "../models/teams";

describe("team controller", () => {
  let mock_json: jest.Mock;
  let mock_status: jest.Mock;
  let res: any;

  beforeEach(() => {
    mock_json = jest.fn();
    mock_status = jest.fn(() => ({ json: mock_json }));
    res = {
      json: mock_json,
      status: mock_status,
    };

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test("get all teams", async () => {
    const req = {} as any;

    await get_all_teams(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("get a team by id", async () => {
    const req = {
      params: {
        id: "68f902e22c24602e73bfb19d" as String,
      },
    } as any;

    await get_team_by_id(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create team", async () => {
    const req = {
      body: {
        name: "some name",
        players: [],
        is_teen_team: true,
      },
    } as any;

    await create_team(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("update team players", async () => {
    const req = {
      body: "abc", // player to add
      params: { id: "68fed5dc02763e52d791296f" }, // team id
    } as any;

    await update_team_players(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("should return 400 when player does not exist", async () => {
    const req = {
      body: null, // No player data
      params: { id: "68fed5dc02763e52d791296f" },
    } as any;

    await update_team_players(req, res);

    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalledWith({ error: "player data missing" });
  });

  test("should return 500 when player data is empty object", async () => {
    const req = {
      body: {}, // Empty player object
      params: { id: "68fed5dc02763e52d791296f" },
    } as any;

    await update_team_players(req, res);

    expect(mock_status).toHaveBeenCalledWith(500);
    expect(mock_json).toHaveBeenCalledWith({ error: "internal server error" });
  });

  test("get team players", async () => {
    const req = {
      params: {
        id: "68f902e22c24602e73bfb19d" as String,
      },
    } as any;

    await get_team_players(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("get team players - team not found returns 404", async () => {
    jest.spyOn(Team as any, "findById").mockResolvedValue(null as any);

    const req = {
      params: {
        id: "does-not-exist" as String,
      },
    } as any;

    await get_team_players(req, res);
    expect(mock_status).toHaveBeenCalledWith(404);
    expect(mock_json).toHaveBeenCalledWith({ error: "team not found" });
  });

  test("get team players - internal error returns 500", async () => {
    jest
      .spyOn(Team as any, "findById")
      .mockRejectedValue(new Error("db error"));

    const req = {
      params: {
        id: "err" as String,
      },
    } as any;

    await get_team_players(req, res);
    expect(mock_status).toHaveBeenCalledWith(500);
    expect(mock_json).toHaveBeenCalledWith({ error: "internal server error" });
  });
});
