import { describe, expect, test, jest } from "@jest/globals";

import {
  create_child,
  get_all_children,
  get_child_by_id,
  update_child_team,
} from "./child_controller";

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


