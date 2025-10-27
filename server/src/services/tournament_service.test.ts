import { describe, expect, test } from "@jest/globals";
import { ITeam } from "../types";
import { generate_tournament, random_item } from "./tournament_service";

describe("tournament controller", () => {
  (test("generate a tournament", () => {
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
  }),
    test("test pick a random item", () => {
      const nums = [1, 2, 3];
      const num = random_item(nums);

      expect(nums).toContain(num);
    }));
});
