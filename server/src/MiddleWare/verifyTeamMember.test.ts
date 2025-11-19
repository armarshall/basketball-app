import {
  describe,
  expect,
  test,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { verifyTeamMember } from "./verifyTeamMember";
import Team from "../models/teams";
import Guardian from "../models/guardians";
import Teenager from "../models/teenagers";

// Mock the models
jest.mock("../models/teams");
jest.mock("../models/guardians");
jest.mock("../models/teenagers");

describe("verifyTeamMember middleware", () => {
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
      managerId: "guardian123",
    };

    const mockGuardian = {
      _id: "guardian123",
      name: "Manager Name",
      managedTeamId: "team123",
      toString: () => "guardian123",
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
        userId: "guardian123",
        userType: "guardian",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStatus).not.toHaveBeenCalled();
  });

  test("should allow access when teenager is team player", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
    };

    const mockTeenager = {
      _id: "teen123",
      name: "Player Name",
      teamId: "team123",
      toString: () => "teen123",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Teenager.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeenager) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        userId: "teen123",
        userType: "teenager",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockStatus).not.toHaveBeenCalled();
  });

  test("should handle userType variations and query parameters", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
    };

    const mockTeenager = {
      _id: "teen123",
      name: "Player Name",
      teamId: "team123",
      toString: () => "teen123",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Teenager.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeenager) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {},
      query: {
        userId: "teen123",
        userType: "teen",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test("should deny access when guardian is not team manager", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
      managerId: "otherGuardian456",
    };

    const mockGuardian = {
      _id: "guardian123",
      name: "Not Manager",
      managedTeamId: "otherTeam456",
      toString: () => "guardian123",
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
        userId: "guardian123",
        userType: "guardian",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "You are not a member of this team",
    });
  });

  test("should deny access when teenager is not on team", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
    };

    const mockTeenager = {
      _id: "teen123",
      name: "Not on Team",
      teamId: "otherTeam456",
      toString: () => "teen123",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Teenager.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeenager) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        userId: "teen123",
        userType: "teenager",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(403);
    expect(mockJson).toHaveBeenCalledWith({
      error: "You are not a member of this team",
    });
  });

  test("should return 400 when required parameters are missing", async () => {
    // Test missing teamId
    mockReq = {
      params: {},
      body: {
        userId: "user123",
        userType: "guardian",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "teamId, userId, and userType are required",
    });
  });

  test("should return 404 when team not found", async () => {
    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(null) as any;

    mockReq = {
      params: { teamId: "nonexistent" },
      body: {
        userId: "user123",
        userType: "guardian",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

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
        userId: "nonexistent",
        userType: "guardian",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Guardian not found",
    });
  });

  test("should return 404 when teenager not found", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;
    (Teenager.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(null) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        userId: "nonexistent",
        userType: "teenager",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(404);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Teenager not found",
    });
  });

  test("should return 400 for invalid userType", async () => {
    const mockTeam = {
      _id: "team123",
      name: "Test Team",
    };

    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockResolvedValue(mockTeam) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        userId: "user123",
        userType: "invalidType",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Invalid userType. Must be 'Guardian' or 'Teenager'",
    });
  });

  test("should handle database errors", async () => {
    (Team.findById as jest.Mock) = jest
      .fn<() => Promise<any>>()
      .mockRejectedValue(new Error("DB Error")) as any;

    mockReq = {
      params: { teamId: "team123" },
      body: {
        userId: "user123",
        userType: "guardian",
      },
    };

    await verifyTeamMember(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).not.toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });
});
