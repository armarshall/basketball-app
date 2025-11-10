import { describe, expect, test, jest } from "@jest/globals";

import { get_rules, update_rules } from "./rules_controller";

describe("rules controller", () => {
  test("get rules", async () => {
    const req = {} as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await get_rules(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("update rules (valid)", async () => {
    const req = {
      body: { content: "new rules content" },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_rules(req, res);
    expect(mock_json).toHaveBeenCalled();
  });

  test("update rules with invalid content returns 400", async () => {
    const req = {
      body: { content: 123 },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_rules(req, res);

    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalledWith({
      error: "content must be a string",
    });
  });

  test("should return 400 when content is null", async () => {
    const req = {
      body: { content: null },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_rules(req, res);

    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalledWith({
      error: "content must be a string",
    });
  });

  test("should return 400 when content is missing from body", async () => {
    const req = {
      body: {},
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_rules(req, res);

    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalledWith({
      error: "content must be a string",
    });
  });

  test("should return 400 when body is missing", async () => {
    const req = {} as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_rules(req, res);

    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalledWith({
      error: "content must be a string",
    });
  });

  test("should return 400 when content is an array", async () => {
    const req = {
      body: { content: ["rule1", "rule2"] },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_rules(req, res);

    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalledWith({
      error: "content must be a string",
    });
  });

  test("should return 400 when content is an object", async () => {
    const req = {
      body: { content: { text: "some rules" } },
    } as any;

    const mock_json = jest.fn();
    const mock_status = jest.fn().mockReturnValue({ json: mock_json });

    const res = {
      json: mock_json,
      status: mock_status,
    } as any;

    await update_rules(req, res);

    expect(mock_status).toHaveBeenCalledWith(400);
    expect(mock_json).toHaveBeenCalledWith({
      error: "content must be a string",
    });
  });
});
