import { describe, expect, test } from "@jest/globals";
import { ITeam, ITeenager, IChild, IGuardian } from "../../../server/src/types";
import teamService from "./team_service";
import axios from "axios";

test("join teen team", () => {
  const teenager = {
    id: "te1",
    name: "Isaiah",
    dateOfBirth: new Date("2008-05-15"),
    email: "i@abc.com",
    password: "secret",
  };
  /*
  // get test TEENAGER team from database mock
  const team: ITeam = axios.get("http://localhost:3000/api/teams/68f9a21ec9d8e1d48d010c13");

  // post teenager to the database
  axios.post("http://localhost:3000/api/teenager", teenager);
  // join team
  teamService.joinTeam(team.id, teenager);

  const updatedTeam: ITeam = axios.get("http://localhost:3000/api/teams/68f9a21ec9d8e1d48d010c13");
  const updatedTeenager: ITeenager = axios.get("http://localhost:3000/api/teenager/te1");

  // expect team and teenager to be updated in the database
  expect(updatedTeam.players).toContain(teenager.id);
  expect(updatedTeenager.teamId).toBe(team.id);
  */
});

test("guardian joins team for child", () => {
  const guardian = {
    id: "g1",
    name: "J",
    dateOfBirth: new Date("1980-01-01"),
    email: "j@j.com",
    password: "secret",
    childId: "c1",
  };
  const child = {
    id: "c1",
    name: "j",
    dateOfBirth: new Date("2015-03-22"),
    guardianId: guardian.id,
  };
  // get test CHILD team from database
  const team = axios.get(
    "http://localhost:3000/api/teams/68f902e22c24602e73bfb19d",
  );

  // post guardian, child, and team to the database

  // expect child to be added to team and updated in the database
});

test("join child team with teen account", () => {});

test("join teen team with child account", () => {});

test("join full team", () => {});

test("guardian does not have a child", () => {});

test("child is already on a team", () => {});

test("join non-existent team", () => {});

test("invalid child id", () => {});

test("invalid guardian id", () => {});
