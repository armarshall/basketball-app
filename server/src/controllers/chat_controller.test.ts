import {
  describe,
  expect,
  test,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { Request, Response } from "express";
import { sendMessage, getMessages } from "./chat_controller";
import Message from "../models/messages";
import Guardian from "../models/guardians";
import Teenager from "../models/teenagers";

// Mock the models
jest.mock("../models/messages");
jest.mock("../models/guardians");
jest.mock("../models/teenagers");

describe("chat_controller", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson }));
    mockRes = {
      json: mockJson,
      status: mockStatus,
    } as any;
    jest.clearAllMocks();
    // Reset Message mock to default implementation
    (Message as jest.MockedClass<typeof Message>).mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("sendMessage", () => {
    test("should send message successfully with guardian sender", async () => {
      const mockGuardian = {
        _id: "guardian123",
        name: "John Doe",
      };

      const mockSave = jest.fn<() => Promise<any>>().mockResolvedValue(true);
      let messageInstance: any;

      (Guardian.findById as jest.Mock) = jest
        .fn<() => Promise<any>>()
        .mockResolvedValue(mockGuardian) as any;
      (Message as jest.MockedClass<typeof Message>).mockImplementation(function(this: any, data?: any) {
        if (data) {
          Object.assign(this, data);
        }
        this._id = "msg123";
        this.save = mockSave;
        messageInstance = this;
        return this;
      });

      mockReq = {
        params: { teamId: "507f1f77bcf86cd799439011" },
        body: {
          userId: "guardian123",
          userType: "guardian",
          content: "Hello team!",
        },
      };

      await sendMessage(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Message sent successfully",
        data: messageInstance,
      });
      expect(mockSave).toHaveBeenCalled();
    });

    test("should send message successfully with teenager sender", async () => {
      const mockTeenager = {
        _id: "teen123",
        name: "Jane Smith",
      };

      const mockSave = jest.fn<() => Promise<any>>().mockResolvedValue(true);
      let messageInstance: any;

      (Teenager.findById as jest.Mock) = jest
        .fn<() => Promise<any>>()
        .mockResolvedValue(mockTeenager) as any;
      (Message as jest.MockedClass<typeof Message>).mockImplementation(function(this: any, data?: any) {
        if (data) {
          Object.assign(this, data);
        }
        this._id = "msg123";
        this.save = mockSave;
        messageInstance = this;
        return this;
      });

      mockReq = {
        params: { teamId: "507f1f77bcf86cd799439011" },
        body: {
          userId: "teen123",
          userType: "teenager",
          content: "Hi everyone!",
        },
      };

      await sendMessage(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Message sent successfully",
        data: messageInstance,
      });
    });

    test("should handle 'teen' userType variation", async () => {
      const mockTeenager = {
        _id: "teen123",
        name: "Jane Smith",
      };

      const mockMessage = {
        _id: "msg123",
        teamId: "507f1f77bcf86cd799439011",
        senderId: "teen123",
        senderType: "Teenager",
        content: "Test message",
        senderName: "Jane Smith",
        timestamp: new Date(),
        save: jest.fn<() => Promise<any>>().mockResolvedValue(true),
      };

      (Teenager.findById as jest.Mock) = jest
        .fn<() => Promise<any>>()
        .mockResolvedValue(mockTeenager) as any;
      (Message as jest.MockedClass<typeof Message>).mockImplementation(function(this: any) {
        Object.assign(this, mockMessage);
        return this;
      });

      mockReq = {
        params: { teamId: "507f1f77bcf86cd799439011" },
        body: {
          userId: "teen123",
          userType: "teen",
          content: "Test message",
        },
      };

      await sendMessage(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
    });

    test("should return 400 when content is empty, missing, or only whitespace", async () => {
      // Test empty content
      mockReq = {
        params: { teamId: "507f1f77bcf86cd799439011" },
        body: {
          userId: "user123",
          userType: "guardian",
          content: "",
        },
      };

      await sendMessage(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Message content is required",
      });
    });

    test("should use 'Unknown' sender name when guardian not found", async () => {
      (Guardian.findById as jest.Mock) = jest
        .fn<() => Promise<any>>()
        .mockResolvedValue(null) as any;
      (Guardian.findOne as jest.Mock) = jest
        .fn<() => Promise<any>>()
        .mockResolvedValue(null) as any;

      const mockMessage = {
        _id: "msg123",
        teamId: "507f1f77bcf86cd799439011",
        senderId: "guardian123",
        senderType: "Guardian",
        content: "Test",
        senderName: "Unknown",
        timestamp: new Date(),
        save: jest.fn<() => Promise<any>>().mockResolvedValue(true),
      };

      (Message as jest.MockedClass<typeof Message>).mockImplementation(function(this: any) {
        Object.assign(this, mockMessage);
        return this;
      });

      mockReq = {
        params: { teamId: "507f1f77bcf86cd799439011" },
        body: {
          userId: "guardian123",
          userType: "guardian",
          content: "Test",
        },
      };

      await sendMessage(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockMessage.save).toHaveBeenCalled();
    });

    test("should handle database error", async () => {
      (Guardian.findById as jest.Mock) = jest
        .fn<() => Promise<any>>()
        .mockRejectedValue(new Error("DB Error")) as any;

      mockReq = {
        params: { teamId: "507f1f77bcf86cd799439011" },
        body: {
          userId: "guardian123",
          userType: "guardian",
          content: "Test message",
        },
      };

      await sendMessage(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });

  });

  describe("getMessages", () => {
    test("should retrieve messages for a team", async () => {
      const mockMessages = [
        {
          _id: "msg1",
          teamId: "team123",
          senderId: "user1",
          senderType: "Teenager",
          content: "First message",
          senderName: "User One",
          timestamp: new Date("2024-01-01"),
        },
        {
          _id: "msg2",
          teamId: "team123",
          senderId: "user2",
          senderType: "Guardian",
          content: "Second message",
          senderName: "User Two",
          timestamp: new Date("2024-01-02"),
        },
      ];

      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn<() => Promise<any>>().mockResolvedValue(mockMessages) as any,
        }),
      });

      (Message.find as jest.Mock) = mockFind as any;

      mockReq = {
        params: { teamId: "team123" },
        query: {},
      };

      await getMessages(mockReq as Request, mockRes as Response);

      expect(mockFind).toHaveBeenCalledWith({ teamId: "team123" });
      expect(mockJson).toHaveBeenCalledWith(mockMessages);
    });

    test("should respect limit parameter", async () => {
      const mockMessages: any[] = [];

      const mockLimit = jest.fn<() => Promise<any>>().mockResolvedValue(mockMessages) as any;
      const mockSort = jest.fn().mockReturnValue({
        limit: mockLimit,
      });
      const mockFind = jest.fn().mockReturnValue({
        sort: mockSort,
      });

      (Message.find as jest.Mock) = mockFind as any;

      mockReq = {
        params: { teamId: "team123" },
        query: { limit: "50" },
      };

      await getMessages(mockReq as Request, mockRes as Response);

      expect(mockLimit).toHaveBeenCalledWith(50);
    });



    test("should handle database error in getMessages", async () => {
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn<() => Promise<any>>().mockRejectedValue(new Error("DB Error")) as any,
        }),
      });

      (Message.find as jest.Mock) = mockFind as any;

      mockReq = {
        params: { teamId: "team123" },
        query: {},
      };

      await getMessages(mockReq as Request, mockRes as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Internal server error",
      });
    });
  });
});
