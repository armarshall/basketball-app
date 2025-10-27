import { describe, expect, test } from "@jest/globals";
import { ITeam, ITeenager, IChild, IGuardian } from "../../../server/types";
import { joinTeam } from "./team_service";

test("join teen team", () => {
  const teenager: ITeenager = {
    id: "1",
    name: "Isaiah",
    dateOfBirth: new Date("2008-05-15"), 
    email: "i@abc.com",
    password: "secret"
  };
  const team: ITeam = {
    id: "930",
    name: "A Team",
    players: "12", "23",
    is_teen_team: true
  };

  const result = joinTeam(team.id, teenager);
  // expect team and teenager to be updated in the database
})

test("guardian joins team for child", () => {})

test("join child team with teen account", () => {})

test("join teen team with child account", () => {})

test("join full team", () => {})

test("guardian does not have a child", () => {})

test("child is already on a team", () => {})

test("join non-existent team", () => {})

test("invalid child id", () => {})

test("invalid guardian id", () => {})