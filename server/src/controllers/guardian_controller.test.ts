import { describe, expect, test, jest, beforeEach } from "@jest/globals";
import Guardian from "../models/guardians";

import {
  create_guardian,
  get_all_guardians,
  get_guardian_by_id,
} from "./guardian_controller";

describe("guardian controller", () => {
  beforeEach(async () => {
    await Guardian.deleteMany({});
  });

  test("get all guardians", async () => {
    const req = {} as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await get_all_guardians(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("get a guardian by id", async () => {
    const req = {
      params: {
        id: "68f902e22c24602e73bfb19d" as String,
      },
    } as any;

    const mock_json = jest.fn();

    const res = {
      json: mock_json,
    } as any;

    await get_guardian_by_id(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create guardian (valid)", async () => {
    const req = {
      body: {
        name: "Jane Doe",
        dateOfBirth: "1980-05-20",
        email: "jane.doe@example.com",
        password: "supersecret",
        childId: "child-123",
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn();

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_guardian(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create guardian with missing body returns 400", async () => {
    const req = {} as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_guardian(req, res);
    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create guardian missing required field returns 400", async () => {
    const req = {
      body: {
        // name missing
        dateOfBirth: "1980-05-20",
        email: "missing.name@example.com",
        password: "pw",
        childId: "child-123",
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_guardian(req, res);
    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalled();
  });

  test("create guardian with invalid date returns 400", async () => {
    const req = {
      body: {
        name: "Invalid Date",
        dateOfBirth: "not-a-date",
        email: "invalid.date@example.com",
        password: "pw",
        childId: "child-123",
      },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await create_guardian(req, res);
    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalled();
  });
});


