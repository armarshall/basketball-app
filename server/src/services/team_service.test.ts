import { describe, expect, test, jest } from "@jest/globals";

import { create_team, get_all_teams, get_team_by_id } from "./team_service";

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
});
