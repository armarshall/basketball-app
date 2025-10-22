import express from "express";
import teamRouter from "./routes/team_router";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/ping", (_req, res) => {
  console.log("someone pinged here");
  res.send("pong");
});

app.use("/api/teams", teamRouter);

app.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}/`);
});
