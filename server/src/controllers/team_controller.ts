// server/src/controllers/team_controller.ts
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
    const teamPlayerIds = team.players.map((p: mongoose.Types.ObjectId) => p.toString());

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

    const playerIdString = teenager._id!.toString();
    team.players = team.players.filter((p: mongoose.Types.ObjectId) => p.toString() !== playerIdString);
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

// Teenager joins team as player - FIXED VERSION
export const join_team_as_player = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId, teenagerId } = req.body;

    console.log("🔍 Join as player request:", { teamId, teenagerId });

    if (!teamId || !teenagerId) {
      console.log("❌ Missing teamId or teenagerId");
      res.status(400).json({ error: "teamId and teenagerId are required" });
      return;
    }

    // Validate teamId format
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      console.log("❌ Invalid teamId format:", teamId);
      res.status(400).json({ error: "Invalid team ID format" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      console.log("❌ Team not found:", teamId);
      res.status(404).json({ error: "Team not found" });
      return;
    }

    console.log("✅ Team found:", team.name);

    team.players = cleanPlayersArray(team.players);

    const Teenager = (await import("../models/teenagers")).default;

    // Validate teenagerId format
    if (!mongoose.Types.ObjectId.isValid(teenagerId)) {
      console.log("❌ Invalid teenagerId format:", teenagerId);
      res.status(400).json({ error: "Invalid teenager ID format" });
      return;
    }

    // Check if the ID belongs to a teenager (not a guardian)
    const teenager = await Teenager.findById(teenagerId);
    
    // Check if it's actually a guardian trying to join as player
    const GuardianModel = (await import("../models/guardians")).default;
    const guardian = await GuardianModel.findById(teenagerId);

    if (guardian) {
      console.log("❌ User is a guardian, cannot join as player");
      res.status(400).json({ 
        error: "Guardians cannot join teams as players. Please join as a manager instead." 
      });
      return;
    }

    if (!teenager) {
      console.log("❌ Teenager not found:", teenagerId);
      res.status(404).json({ error: "Teenager not found. Only teenagers can join as players." });
      return;
    }

    console.log("✅ Teenager found:", teenager.name);

    // Check if teenager is already on a team
    if (teenager.teamId) {
      console.log("❌ Teenager already on team:", teenager.teamId);
      res.status(409).json({ error: "You are already on a team" });
      return;
    }

    // Check if teenager is already in this team's players array
    const isAlreadyInTeam = team.players.some(
      (playerId) => playerId.toString() === teenagerId
    );
    
    if (isAlreadyInTeam) {
      console.log("❌ Teenager already in this team");
      res.status(409).json({ error: "You are already a member of this team" });
      return;
    }

    // Add teenager to team and update teenager's teamId
    team.players.push(new mongoose.Types.ObjectId(teenagerId));
    teenager.teamId = new mongoose.Types.ObjectId(teamId);

    // Save both team and teenager
    await team.save();
    await teenager.save();

    console.log("✅ Successfully joined team");

    // Return updated team with populated data
    const updatedTeam = await Team.findById(teamId)
      .populate("players")
      .populate("managerId");

    res.json({
      message: "Successfully joined team!",
      team: updatedTeam,
      teenager: {
        _id: teenager._id,
        name: teenager.name,
        email: teenager.email,
        teamId: teenager.teamId
      },
    });
  } catch (err: any) {
    console.error("❌ Error in join_team_as_player:", err);
    console.error("❌ Error details:", err.message);
    res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
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

// Update team settings
export const update_team_settings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { settings, guardianId } = req.body;

    if (!settings || !guardianId) {
      res.status(400).json({ error: "settings and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    // Verify the user is the manager of this team
    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ error: "You are not the manager of this team" });
      return;
    }

    // Update team settings
    if (!team.teamSettings) {
      team.teamSettings = {};
    }

    // Update only the provided settings
    team.teamSettings = {
      ...team.teamSettings,
      ...settings
    };

    await team.save();

    const updatedTeam = await Team.findById(teamId).populate("players").populate("managerId");

    res.json({
      message: "Team settings updated successfully!",
      team: updatedTeam
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get team settings
export const get_team_settings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { guardianId } = req.query;

    if (!guardianId) {
      res.status(400).json({ error: "guardianId is required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    // Verify the user is the manager of this team
    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ error: "You are not the manager of this team" });
      return;
    }

    res.json({
      teamSettings: team.teamSettings || {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Send team invitation email
export const send_team_invitation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { playerEmail, guardianId } = req.body;

    if (!playerEmail || !guardianId) {
      res.status(400).json({ error: "playerEmail and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    // Verify the user is the manager of this team
    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ error: "You are not the manager of this team" });
      return;
    }

    const guardian = await Guardian.findById(guardianId);
    if (!guardian) {
      res.status(404).json({ error: "Guardian not found" });
      return;
    }

    // Import and use email service
    const { sendTeamInvitation } = await import("../services/email_service");
    
    const emailSent = await sendTeamInvitation(
      playerEmail,
      team.name,
      guardian.name,
      teamId
    );

    if (emailSent) {
      res.json({
        message: "Team invitation sent successfully!",
        sentTo: playerEmail
      });
    } else {
      res.status(500).json({ error: "Failed to send invitation email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get team statistics
export const get_team_statistics = async (
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

    const Teenager = (await import("../models/teenagers")).default;
    
    // Get detailed player stats
    const playersWithStats = await Promise.all(
      team.players.map(async (playerId) => {
        const player = await Teenager.findById(playerId);
        if (player && player.game_stats) {
          const totalStats = player.game_stats.reduce((acc, game) => ({
            points: acc.points + (game.statline?.points || 0),
            rebounds: acc.rebounds + (game.statline?.rebounds || 0),
            assists: acc.assists + (game.statline?.assists || 0),
            steals: acc.steals + (game.statline?.steals || 0),
            blocks: acc.blocks + (game.statline?.blocks || 0),
            gamesPlayed: acc.gamesPlayed + 1
          }), { points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, gamesPlayed: 0 });

          return {
            playerId: player._id,
            playerName: player.name,
            ...totalStats,
            averagePoints: totalStats.gamesPlayed > 0 ? (totalStats.points / totalStats.gamesPlayed).toFixed(1) : "0.0",
            averageRebounds: totalStats.gamesPlayed > 0 ? (totalStats.rebounds / totalStats.gamesPlayed).toFixed(1) : "0.0",
            averageAssists: totalStats.gamesPlayed > 0 ? (totalStats.assists / totalStats.gamesPlayed).toFixed(1) : "0.0"
          };
        }
        return null;
      })
    );

    const validPlayers = playersWithStats.filter(Boolean);

    // Calculate team totals
    const teamTotals = validPlayers.reduce((acc, player: any) => ({
      totalPoints: acc.totalPoints + player.points,
      totalRebounds: acc.totalRebounds + player.rebounds,
      totalAssists: acc.totalAssists + player.assists,
      totalSteals: acc.totalSteals + player.steals,
      totalBlocks: acc.totalBlocks + player.blocks,
      totalGames: acc.totalGames + player.gamesPlayed
    }), { totalPoints: 0, totalRebounds: 0, totalAssists: 0, totalSteals: 0, totalBlocks: 0, totalGames: 0 });

    res.json({
      teamId: team._id,
      teamName: team.name,
      totalPlayers: team.players.length,
      playerStatistics: validPlayers,
      teamTotals,
      averages: {
        pointsPerGame: teamTotals.totalGames > 0 ? (teamTotals.totalPoints / teamTotals.totalGames).toFixed(1) : "0.0",
        reboundsPerGame: teamTotals.totalGames > 0 ? (teamTotals.totalRebounds / teamTotals.totalGames).toFixed(1) : "0.0",
        assistsPerGame: teamTotals.totalGames > 0 ? (teamTotals.totalAssists / teamTotals.totalGames).toFixed(1) : "0.0"
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update team image
export const update_team_image = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { imageUrl, guardianId } = req.body;

    if (!imageUrl || !guardianId) {
      res.status(400).json({ error: "imageUrl and guardianId are required" });
      return;
    }

    const team = await Team.findById(teamId);
    if (!team) {
      res.status(404).json({ error: "Team not found" });
      return;
    }

    // Verify the user is the manager of this team
    if (team.managerId?.toString() !== guardianId) {
      res.status(403).json({ error: "You are not the manager of this team" });
      return;
    }

    // Update team image
    if (!team.teamSettings) {
      team.teamSettings = {};
    }

    team.teamSettings.teamImage = imageUrl;
    await team.save();

    res.json({
      message: "Team image updated successfully!",
      team: {
        id: team._id,
        name: team.name,
        teamImage: team.teamSettings.teamImage
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};