import { expect, test } from "@jest/globals";
import teamService from "./team_service";
import axios from "axios";

test("join teen team", async () => {
  const teenager = await axios.get(
    "http://localhost:3000/api/teenagers/id/68fae285c475c441b39bf744",
  );
  const team = await axios.get(
    "http://localhost:3000/api/teams/68f9a21ec9d8e1d48d010c13",
  );
  // join team
  await teamService.joinTeam(team.data._id, teenager.data);

  const updatedTeam = await axios.get(
    "http://localhost:3000/api/teams/68f9a21ec9d8e1d48d010c13",
  );
  const updatedTeenager = await axios.get(
    "http://localhost:3000/api/teenagers/id/68fae285c475c441b39bf744",
  );

  // expect team and teenager to be updated in the database
  expect(updatedTeam.data.players).toContain(teenager.data.id);
  expect(updatedTeenager.data.teamId).toBe(team.data.id);
});

test("invalid teen id", async () => {});

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
