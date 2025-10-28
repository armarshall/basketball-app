import { describe, expect, test, jest } from "@jest/globals";

import {
  create_team,
  get_all_teams,
  get_team_by_id,
  update_team_players,
} from "./team_service";

describe("team controller", () => {
  test("get all teams", async () => {
    const req = {} as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await get_all_teams(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("get a team by id", async () => {
    const req = {
      params: {
        id: "68f902e22c24602e73bfb19d" as String,
      },
    } as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
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

    const mock_json = jest.fn();
    const mock_status = jest.fn();

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_team(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("update team players", async () => {
    const req = {
      body: "abc", // player to add
      params: {
        id: "68fed5dc02763e52d791296f", // team id
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn();

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_team_players(req, res);
    expect(mock_json).toHaveBeenCalled();
  });
});
