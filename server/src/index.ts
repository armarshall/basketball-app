require("dotenv").config();

import express from "express";

import teamRouter from "./routes/team_router";
import guardianRouter from "./routes/guardian_router";
import teenagerRouter from "./routes/teenager_router";
import childRouter from "./routes/child_router";
import tournamentRouter from "./routes/tournament_router";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/ping", (_req, res) => {
  console.log("someone pinged here");
  res.send("pong");
});

app.use("/api/teams", teamRouter);
app.use("/api/guardians", guardianRouter);
app.use("/api/teenagers", teenagerRouter);
app.use("/api/children", childRouter);

app.use("/api/tournaments", tournamentRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
