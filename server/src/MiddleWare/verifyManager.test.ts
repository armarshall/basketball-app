import {
  describe,
  expect,
  test,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { verifyManager } from "./verifyManager";
import Team from "../models/teams";
import Guardian from "../models/guardians";

// Mock the models
jest.mock("../models/teams");
jest.mock("../models/guardians");

describe("verifyManager middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    mockNext = jest.fn();
    mockRes = {
      json: mockJson,
      status: mockStatus,
    } as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should allow access when guardian is team manager", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
      managerId: {
        toString: () => "guardian123",
      },
    };

    const mockGuardian = {
      _id: "guardian123",
      name: "Manager Name",
      isManager: true,
      managedTeamId: "team123",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Guardian.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockGuardian) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        guardianId: "guardian123",
      },
    };

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStatus).not.toHaveBeenCalled();
  });

  test("should deny access when guardian is not team manager", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
      managerId: {
        toString: () => "otherGuardian456",
      },
    };

    const mockGuardian = {
      _id: "guardian123",
      name: "Not Manager",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Guardian.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockGuardian) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        guardianId: "guardian123",
      },
    };

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "You are not the manager of this team",
    });
  });

  test("should return 400 when required parameters are missing", async () => {
    // Test missing teamId
    mockReq = {
      params: {},
      body: {
        guardianId: "guardian123",
      },
    };

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "teamId and guardianId are required",
    });
  });

  test("should return 404 when team not found", async () => {
    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(null) as any;

    mockReq = {
      params: { teamId: "nonexistent" },
      body: {
        guardianId: "guardian123",
      },
    };

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Team not found",
    });
  });

  test("should return 404 when guardian not found", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
      managerId: "guardian123",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Guardian.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(null) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        guardianId: "nonexistent",
      },
    };

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Guardian not found",
    });
  });

  test("should handle database errors", async () => {
    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockRejectedValue(new Error("DB Error")) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        guardianId: "guardian123",
      },
    };

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });

  test("should handle managerId variations (string, object, null, undefined)", async () => {
    // Test with string managerId
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
      managerId: "guardian123",
    };

    const mockGuardian = {
      _id: "guardian123",
      name: "Manager Name",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Guardian.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockGuardian) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        guardianId: "guardian123",
      },
    };

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();

    // Test with null managerId
    const mockTeamNull = {
      _id: "team123",
      name: "Test Team",
      managerId: null,
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeamNull) as any;

    await verifyManager(mockReq as Request, mockRes as Response, mockNext);

    expect(mockStatus).toHaveBeenCalledWith(403);
  });
});
