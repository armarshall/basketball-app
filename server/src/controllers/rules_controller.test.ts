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
});
