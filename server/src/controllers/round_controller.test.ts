import { Request, Response } from "express";
import * as roundController from "./round_controller";
import Round from "../models/rounds";
import { mockRequest, mockResponse } from "jest-mock-req-res";

jest.mock("../models/rounds");

describe("Round Controller", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get_all_rounds", () => {
    it("should return all rounds", async () => {
      const mockRounds = [{ tournament: "1", matches: ["1", "2"] }];
      (Round.find as jest.Mock).mockResolvedValue(mockRounds);

      await roundController.get_all_rounds(req, res);

      expect(Round.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRounds);
    });

    it("should handle errors", async () => {
      (Round.find as jest.Mock).mockRejectedValue(new Error());

      await roundController.get_all_rounds(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("get_rounds_by_tournament_id", () => {
    it("should return rounds by tournament id", async () => {
      const mockRounds = [{ tournament: "1", matches: ["1", "2"] }];
      (Round.find as jest.Mock).mockResolvedValue(mockRounds);
      req.params = { id: "1" };

      await roundController.get_rounds_by_tournament_id(req, res);

      expect(Round.find).toHaveBeenCalledWith({ tournament: "1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRounds);
    });

    it("should return 404 if rounds not found", async () => {
      (Round.find as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };

      await roundController.get_rounds_by_tournament_id(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Rounds not found" });
    });

    it("should handle errors", async () => {
      (Round.find as jest.Mock).mockRejectedValue(new Error());
      req.params = { id: "1" };

      await roundController.get_rounds_by_tournament_id(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("get_round_by_id", () => {
    it("should return a round by id", async () => {
      const mockRound = { tournament: "1", matches: ["1", "2"] };
      (Round.findById as jest.Mock).mockResolvedValue(mockRound);
      req.params = { id: "1" };

      await roundController.get_round_by_id(req, res);

      expect(Round.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRound);
    });

    it("should return 404 if round not found", async () => {
      (Round.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };

      await roundController.get_round_by_id(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Round not found" });
    });

    it("should handle errors", async () => {
      (Round.findById as jest.Mock).mockRejectedValue(new Error());
      req.params = { id: "1" };

      await roundController.get_round_by_id(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("create_round", () => {
    it("should create a new round", async () => {
      const mockRound = { tournament: "1", matches: ["1", "2"] };
      (Round.prototype.save as jest.Mock).mockResolvedValue(mockRound);
      req.body = mockRound;

      await roundController.create_round(req, res);

      expect(Round).toHaveBeenCalledWith(mockRound);
      expect(Round.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.anything()); // any object
    });

    it("should handle errors", async () => {
      (Round.prototype.save as jest.Mock).mockRejectedValue(new Error());
      req.body = { tournament: "1", matches: ["1", "2"] };

      await roundController.create_round(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});
