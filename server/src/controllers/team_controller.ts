import { Request, Response } from "express";
import mongoose from "mongoose";
import Team from "../models/teams";
import Guardian from "../models/guardians";

// Get all teams
export const get_all_teams = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const teams = await Team.find({});
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get team by ID
export const get_team_by_id = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get team by name (case-insensitive)
export const get_team_by_name = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const teamName = decodeURIComponent(req.params.name).toLowerCase();
    // Use case-insensitive regex search (escape special regex characters)
    const escapedTeamName = teamName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const team = await Team.findOne({
      name: { $regex: new RegExp(`^${escapedTeamName}$`, "i") },
    });
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new team
export const create_team = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, players, is_teen_team } = req.body;

    if (!name) {
      res.status(400).json({ error: "Team name is required" });
      return;
    }

    const team = new Team({
      name,
      players: players || [],
      is_teen_team: is_teen_team || false,
    });

    const savedTeam = await team.save();
    res.status(201).json(savedTeam);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Clean corrupted players data
const cleanPlayersArray = (players: any): mongoose.Types.ObjectId[] => {
  if (!players) {
    return [];
  }

  if (!Array.isArray(players)) {
    if (typeof players === "string" && players.includes("[")) {
      try {
        const cleanString = players.replace(/\n/g, "").replace(/'/g, '"');
        const parsedArray = JSON.parse(cleanString);
        const cleanedPlayers: mongoose.Types.ObjectId[] = [];

        parsedArray.forEach((item: any) => {
          if (
            typeof item === "string" &&
            mongoose.Types.ObjectId.isValid(item)
          ) {
            cleanedPlayers.push(new mongoose.Types.ObjectId(item));
          }
        });

        return cleanedPlayers;
      } catch (parseError) {
        console.log("Could not parse corrupted player data:", players);
        return [];
      }
    }

    if (
      typeof players === "string" &&
      mongoose.Types.ObjectId.isValid(players)
    ) {
      return [new mongoose.Types.ObjectId(players)];
    }

    return [];
  }

  const cleanedPlayers: mongoose.Types.ObjectId[] = [];

  players.forEach((player) => {
    if (typeof player === "string" && mongoose.Types.ObjectId.isValid(player)) {
      cleanedPlayers.push(new mongoose.Types.ObjectId(player));
    } else if (player instanceof mongoose.Types.ObjectId) {
      cleanedPlayers.push(player);
    } else if (typeof player === "string" && player.includes("[")) {
      try {
        const cleanString = player.replace(/\n/g, "").replace(/'/g, '"');
        const parsedArray = JSON.parse(cleanString);
        parsedArray.forEach((item: any) => {
          if (
            typeof item === "string" &&
            mongoose.Types.ObjectId.isValid(item)
          ) {
            cleanedPlayers.push(new mongoose.Types.ObjectId(item));
          }
        });
      } catch (parseError) {
        console.log("Could not parse corrupted player data:", player);
      }
    }
  });

  return cleanedPlayers;
};

// Add player to team
export const add_player_to_team = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { playerEmail, guardianId } = req.body;

    if (!playerEmail || !guardianId) {
      res
        .status(400)
        .json({ error: "playerEmail and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    team.players = cleanPlayersArray(team.players);

    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ error: "You are not the manager of this team" });
      return;
    }

    const Teenager = (await import("../models/teenagers")).default;
    const teenager = await Teenager.findOne({ email: playerEmail });
    if (!teenager) {
      res.status(404).json({ error: "Player not found with that email" });
      return;
    }

    if (teenager.teamId) {
      res.status(409).json({ error: "This player is already on a team" });
      return;
    }

    const playerIdString = teenager._id!.toString();
    const teamPlayerIds = team.players.map((p) => p.toString());

    if (teamPlayerIds.includes(playerIdString)) {
      res.status(409).json({ error: "Player already in this team" });
      return;
    }

    team.players.push(teenager._id as mongoose.Types.ObjectId);
    teenager.teamId = new mongoose.Types.ObjectId(teamId);

    await team.save();
    await teenager.save();

    const updatedTeam = await Team.findById(teamId).populate("players");

    res.json({
      message: "Player added successfully!",
      team: updatedTeam,
      addedPlayer: teenager,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove player from team
export const remove_player_from_team = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { playerId, guardianId } = req.body;

    if (!playerId || !guardianId) {
      res.status(400).json({ error: "playerId and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    team.players = cleanPlayersArray(team.players);

    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ error: "You are not the manager of this team" });
      return;
    }

    const Teenager = (await import("../models/teenagers")).default;
    const teenager = await Teenager.findById(playerId);
    if (!teenager) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    team.players = team.players.filter((p) => p.toString() !== playerId);
    teenager.teamId = null;

    await team.save();
    await teenager.save();

    const updatedTeam = await Team.findById(teamId).populate("players");

    res.json({
      message: "Player removed successfully!",
      team: updatedTeam,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all players on a team
export const get_team_players = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId).populate("players");
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json(team.players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Guardian joins team as manager
export const join_team_as_manager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId, guardianId } = req.body;

    if (!teamId || !guardianId) {
      res.status(400).json({ error: "teamId and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    const guardian = await Guardian.findById(guardianId);

    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    if (!guardian) {
      res.status(404).json({ error: "Guardian not found" });
      return;
    }

    if (team.managerId) {
      res.status(409).json({ error: "This team already has a manager" });
      return;
    }

    if (guardian.managedTeamId) {
      res.status(409).json({ error: "You are already managing another team" });
      return;
    }

    team.players = cleanPlayersArray(team.players);

    team.managerId = guardian._id as mongoose.Types.ObjectId;
    guardian.isManager = true;
    guardian.managedTeamId = team._id as mongoose.Types.ObjectId;

    await team.save();
    await guardian.save();

    res.json({
      message: "Successfully joined team as manager!",
      team,
      guardian,
    });
  } catch (err) {
    console.error("Error in join_team_as_manager:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Guardian leaves as manager
export const leave_team_as_manager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId, guardianId } = req.body;

    if (!teamId || !guardianId) {
      res.status(400).json({ error: "teamId and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    const guardian = await Guardian.findById(guardianId);

    if (!team || !guardian) {
      res.status(404).json({ error: "Team or guardian not found" });
      return;
    }

    if (team.managerId?.toString() !== guardianId) {
      res.status(400).json({ error: "You are not the manager of this team" });
      return;
    }

    team.managerId = null;
    guardian.isManager = false;
    guardian.managedTeamId = null;

    await team.save();
    await guardian.save();

    res.json({ message: "Successfully left as manager!", team, guardian });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all teams with manager info
export const get_teams_with_managers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const teams = await Team.find({}).populate("managerId");
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get team by guardian ID
export const get_guardian_team = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { guardianId } = req.params;
    const team = await Team.findOne({ managerId: guardianId });
    if (!team) {
      res.status(404).json({ error: "No team found for this guardian" });
      return;
    }
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Teenager joins team as player
export const join_team_as_player = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId, teenagerId } = req.body;

    if (!teamId || !teenagerId) {
      res.status(400).json({ error: "teamId and teenagerId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    team.players = cleanPlayersArray(team.players);

    const Teenager = (await import("../models/teenagers")).default;

    const teenager = await Teenager.findById(teenagerId);
    if (!teenager) {
      res.status(404).json({ error: "Teenager not found" });
      return;
    }

    if (teenager.teamId) {
      res.status(409).json({ error: "You are already on a team" });
      return;
    }

    team.players.push(new mongoose.Types.ObjectId(teenagerId));
    const updatedTeam = await team.save();

    teenager.teamId = new mongoose.Types.ObjectId(teamId);
    await teenager.save();

    res.json({
      message: "Successfully joined team!",
      team: updatedTeam,
      teenager: teenager,
    });
  } catch (err) {
    console.error("Error in join_team_as_player:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get team details with players (accessible to all users)
export const get_team_with_players = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId)
      .populate("players")
      .populate("managerId");

    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get managed teams for guardian
export const get_my_managed_teams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { guardianId } = req.params;

    const teams = await Team.find({ managerId: guardianId });
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Debug team manager
export const debug_team_manager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    res.json({
      teamId: team._id,
      teamName: team.name,
      managerId: team.managerId,
      managerIdString: team.managerId?.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
