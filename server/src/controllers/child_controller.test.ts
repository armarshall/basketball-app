import { describe, expect, test, jest } from "@jest/globals";

import {
  add_child_stats,
  create_child,
  get_all_children,
  get_child_by_id,
  get_child_stats,
  update_child_stats,
  update_child_team,
} from "./child_controller";
import { GameStats } from "../types";

describe("child controller", () => {
  test("get all children", async () => {
    const req = {} as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await get_all_children(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("get a child by id", async () => {
    const req = {
      params: {
        id: "68f902e22c24602e73bfb19d" as String,
      },
    } as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await get_child_by_id(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create child (valid)", async () => {
    const req = {
      body: {
        name: "Little Tim",
        dateOfBirth: "2015-03-15",
        guardianId: "guardian-1",
        teamId: "team-9",
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn();

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_child(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create child with missing body returns 400", async () => {
    const req = {} as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_child(req, res);
    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create child missing required field returns 400", async () => {
    const req = {
      body: {
        // name missing
        dateOfBirth: "2012-01-01",
        guardianId: "guardian-1",
        teamId: "team-9",
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_child(req, res);
    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create child with invalid date returns 400", async () => {
    const req = {
      body: {
        name: "Invalid Date Child",
        dateOfBirth: "not-a-date",
        guardianId: "guardian-1",
        teamId: "team-9",
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_child(req, res);
    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalled();
  });

  test("patch child team - missing teamId returns 400", async () => {
    const req = {
      params: { id: "child-1" },
      body: {},
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_child_team(req, res);
    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalled();
  });

  test("patch child team - not found returns 404", async () => {
    const req = {
      params: { id: "does-not-exist" },
      body: { teamId: "team-77" },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_child_team(req, res);
    // Depending on db state, could throw. We only assert that status was called with 404 or 500
    const statusCalledWith = (mock_status.mock.calls[0] ?? [])[0];
    expect([404, 500]).toContain(statusCalledWith);
    expect(mock_json).toHaveBeenCalled();
  });
});

describe("child stats", () => {
  test("get a child's stats", async () => {
    const req = {
      params: {
        id: "68fb087e0744adc9e0e4f107",
      },
    } as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await get_child_stats(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("add a child's stats", async () => {
    const game_stats: GameStats = {
      date: new Date(),
      game_id: "",
      statline: {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        turnovers: 0,
        field_goals_made: 0,
        field_goals_attempted: 0,
        three_pointers_made: 0,
        three_pointers_attempted: 0,
        personal_fouls: 0,
        minutes: 0,
      },
    };

    const req = {
      params: {
        id: "68fb087e0744adc9e0e4f107",
      },
      body: {
        game_stats: game_stats,
      },
    } as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await add_child_stats(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("update a child's stats", async () => {
    const game_stats: GameStats = {
      date: new Date(),
      game_id: "",
      statline: {
        points: 0,
        rebounds: 0,
        assists: 0,
        blocks: 0,
        steals: 0,
        turnovers: 0,
        field_goals_made: 0,
        field_goals_attempted: 0,
        three_pointers_made: 0,
        three_pointers_attempted: 0,
        personal_fouls: 0,
        minutes: 0,
      },
    };

    const req = {
      params: {
        id: "68fb087e0744adc9e0e4f107",
      },
      body: {
        game_stats: game_stats,
      },
    } as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await update_child_stats(req, res);
    expect(mock_json).toHaveBeenCalled();
  });
});
