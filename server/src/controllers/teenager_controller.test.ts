import { describe, test, jest, expect } from "@jest/globals";
import {
  add_teenager_stats,
  get_teenager_stats,
  update_teenager_stats,
} from "./teenager_controller";
import { GameStats } from "../types";

describe("teen stats", () => {
  test("get a teen's stats", async () => {
    const req = {
      params: {
        id: "68fb087e0744adc9e0e4f107",
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await get_teenager_stats(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("add a teens's stats", async () => {
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
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await add_teenager_stats(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("update a teen's stats", async () => {
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
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_teenager_stats(req, res);
    expect(mock_json).toHaveBeenCalled();
  });
});
