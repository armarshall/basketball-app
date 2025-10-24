// Temporary hardcode to get it working
process.env.MONGODB_URI = "mongodb+srv://dbadmin:dbadmin123@cluster0.gpibipl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
process.env.PORT = "3000";

console.log('Using MongoDB Atlas connection');

import express from "express";
import cors from "cors";
import { connectDB } from "./database";

import teamRouter from "./routes/team_router";
import guardianRouter from "./routes/guardian_router";
import teenagerRouter from "./routes/teenager_router";
import childRouter from "./routes/child_router";
import tournamentRouter from "./routes/tournament_router";
import imageRouter from './routes/imageRoutes';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

connectDB();

app.get("/ping", (_req, res) => {
  console.log("someone pinged here");
  res.send("pong");
});

app.use("/api/teams", teamRouter);
app.use("/api/guardians", guardianRouter);
app.use("/api/teenagers", teenagerRouter);
app.use("/api/children", childRouter);
app.use("/api/tournaments", tournamentRouter);
app.use('/api/images', imageRouter);
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}/`);
});