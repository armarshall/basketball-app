import { describe, expect, test, jest } from "@jest/globals";

import {
  get_all_tournaments,
  get_tournament_by_id,
} from "./tournament_controller";

describe("tournament controller", () => {
  // Note: generate_tournament, generate_next_round, and shuffle functions
  // are not currently exported from tournament_controller.ts
  // These tests are commented out until those functions are available

  test(
    "get all tournaments",
    async () => {
      const req = {} as any;

      const mock_json = jest.fn();

      const res = {
        json: mock_json,
      } as any;

      await get_all_tournaments(req, res);
      expect(mock_json).toHaveBeenCalled();
    },
    5 * 1000
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

    await get_tournament_by_id(req, res);
    expect(mock_json).toHaveBeenCalled();
  });
});
