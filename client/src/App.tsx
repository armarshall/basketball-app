import { BrowserRouter, Routes, Route } from "react-router-dom";

import MenuAppBar from "./components/MenuAppBar";
import Home from "./pages/Home";
import Rules from "./pages/Rules";
import Team from "./pages/Team";
import Standings from "./pages/Standings";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import GuardianSignUp from "./pages/GuardianSignUp";
import TeenagerSignUp from "./pages/TeenagerSignUp";
import LogIn from "./pages/LogIn";
import { TeamCreation } from "./pages/TeamCreation";

function App() {
  return (
    <BrowserRouter>
      <MenuAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/team" element={<Team />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/guardian" element={<GuardianSignUp />} />
        <Route path="/signup/teenager" element={<TeenagerSignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/teamcreate" element={<TeamCreation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
