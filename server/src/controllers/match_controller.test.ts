import { Request, Response } from "express";
import * as matchController from "./match_controller";
import Match from "../models/matches";
import Team from "../models/teams";
import { mockRequest, mockResponse } from "jest-mock-req-res";

jest.mock("../models/matches");
jest.mock("../models/teams");

describe("Match Controller", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get_all_matches", () => {
    it("should return all matches", async () => {
      const mockMatches = [{ team1_id: "1", team2_id: "2" }];
      (Match.find as jest.Mock).mockResolvedValue(mockMatches);

      await matchController.get_all_matches(req, res);

      expect(Match.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMatches);
    });

    it("should handle errors", async () => {
      (Match.find as jest.Mock).mockRejectedValue(new Error());

      await matchController.get_all_matches(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("get_matches_by_round_id", () => {
    it("should return matches by round id", async () => {
      const mockMatches = [{ team1_id: "1", team2_id: "2", round_id: "1" }];
      (Match.find as jest.Mock).mockResolvedValue(mockMatches);
      req.params = { id: "1" };

      await matchController.get_matches_by_round_id(req, res);

      expect(Match.find).toHaveBeenCalledWith({ round_id: "1" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMatches);
    });

    it("should handle errors", async () => {
      (Match.find as jest.Mock).mockRejectedValue(new Error());
      req.params = { id: "1" };

      await matchController.get_matches_by_round_id(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("get_match_by_id", () => {
    it("should return a match by id", async () => {
      const mockMatch = { team1_id: "1", team2_id: "2" };
      (Match.findById as jest.Mock).mockResolvedValue(mockMatch);
      req.params = { id: "1" };

      await matchController.get_match_by_id(req, res);

      expect(Match.findById).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMatch);
    });

    it("should return 404 if match not found", async () => {
      (Match.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };

      await matchController.get_match_by_id(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Match not found" });
    });

    it("should handle errors", async () => {
      (Match.findById as jest.Mock).mockRejectedValue(new Error());
      req.params = { id: "1" };

      await matchController.get_match_by_id(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("get_teams_by_match_id", () => {
    it("should return teams by match id", async () => {
      const mockMatch = { _id: "1", team1_id: "1", team2_id: "2" };
      const mockTeam1 = { _id: "1", name: "Team 1" };
      const mockTeam2 = { _id: "2", name: "Team 2" };

      (Match.findById as jest.Mock).mockResolvedValue(mockMatch);
      (Team.findById as jest.Mock).mockImplementation((id) => {
        if (id === "1") return Promise.resolve(mockTeam1);
        if (id === "2") return Promise.resolve(mockTeam2);
        return Promise.resolve(null);
      });

      req.params = { id: "1" };

      await matchController.get_teams_by_match_id(req, res);

      expect(Match.findById).toHaveBeenCalledWith("1");
      expect(Team.findById).toHaveBeenCalledWith("1");
      expect(Team.findById).toHaveBeenCalledWith("2");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        team1: mockTeam1,
        team2: mockTeam2,
      });
    });

    it("should return 404 if match not found", async () => {
      (Match.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };

      await matchController.get_teams_by_match_id(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Match not found" });
    });

    it("should return 404 if team not found", async () => {
      const mockMatch = { _id: "1", team1_id: "1", team2_id: "2" };
      (Match.findById as jest.Mock).mockResolvedValue(mockMatch);
      (Team.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };

      await matchController.get_teams_by_match_id(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Team not found" });
    });

    it("should handle errors", async () => {
      (Match.findById as jest.Mock).mockRejectedValue(new Error());
      req.params = { id: "1" };

      await matchController.get_teams_by_match_id(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("create_match", () => {
    it("should create a new match", async () => {
      const mockMatch = {
        team1_id: "1",
        team2_id: "2",
        start_date_time: "2024-01-01T00:00:00.000Z",
        round_id: "1",
      };
      (Match.prototype.save as jest.Mock).mockResolvedValue(mockMatch);
      req.body = mockMatch;

      await matchController.create_match(req, res);

      expect(Match).toHaveBeenCalledWith(mockMatch);
      expect(Match.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.anything()); // any object
    });

    it("should handle errors", async () => {
      (Match.prototype.save as jest.Mock).mockRejectedValue(new Error());
      req.body = {
        team1_id: "1",
        team2_id: "2",
        start_date_time: "2024-01-01T00:00:00.000Z",
        round_id: "1",
      };

      await matchController.create_match(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("update_match", () => {
    it("should update a match", async () => {
      const mockMatch = {
        team1_id: "1",
        team2_id: "2",
        start_date_time: "2024-01-01T00:00:00.000Z",
      };
      (Match.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockMatch);
      req.params = { id: "1" };
      req.body = mockMatch;

      await matchController.update_match(req, res);

      expect(Match.findByIdAndUpdate).toHaveBeenCalledWith(
        "1",
        {
          team1_id: "1",
          team2_id: "2",
          start_date_time: "2024-01-01T00:00:00.000Z",
        },
        { new: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockMatch);
    });

    it("should return 404 if match not found", async () => {
      (Match.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };
      req.body = {
        team1_id: "1",
        team2_id: "2",
        start_date_time: "2024-01-01T00:00:00.000Z",
      };

      await matchController.update_match(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Match not found" });
    });

    it("should handle errors", async () => {
      (Match.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error());
      req.params = { id: "1" };
      req.body = {
        team1_id: "1",
        team2_id: "2",
        start_date_time: "2024-01-01T00:00:00.000Z",
      };

      await matchController.update_match(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });

  describe("delete_match", () => {
    it("should delete a match", async () => {
      const mockMatch = { team1_id: "1", team2_id: "2" };
      (Match.findByIdAndDelete as jest.Mock).mockResolvedValue(mockMatch);
      req.params = { id: "1" };

      await matchController.delete_match(req, res);

      expect(Match.findByIdAndDelete).toHaveBeenCalledWith("1");
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it("should return 404 if match not found", async () => {
      (Match.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
      req.params = { id: "1" };

      await matchController.delete_match(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Match not found" });
    });

    it("should handle errors", async () => {
      (Match.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error());
      req.params = { id: "1" };

      await matchController.delete_match(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error",
      });
    });
  });
});
