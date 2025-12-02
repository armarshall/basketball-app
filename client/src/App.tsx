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
import Sponsors from "./pages/Sponsors";
import ImageUpload from "./pages/ImageUpload";
import { StatsViewerPage } from "./pages/StatsViewerTestPage";
import { StatsEditorPage } from "./pages/StatsEditorTestPage";
import TeamSelection from "./components/TeamSelection";
import ManagerProfile from "./components/ManagerProfile";
import TeamSettings from "./pages/TeamSettings";
import AdminEvents from "./pages/AdminEvents";
import TeamDetails from "./pages/TeamDetails"; // ADD THIS IMPORT

function App() {
  return (
    <BrowserRouter>
      <MenuAppBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/admin/events" element={<AdminEvents />} />

        {/* Team Routes - ADD THIS ROUTE */}
        <Route path="/team/:id" element={<TeamDetails />} />

        <Route path="/team/:id/settings" element={<TeamSettings />} />
        <Route path="/team" element={<Team />} />

        <Route path="/standings" element={<Standings />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signup/guardian" element={<GuardianSignUp />} />
        <Route path="/signup/teenager" element={<TeenagerSignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/teamcreate" element={<TeamCreation />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/upload" element={<ImageUpload />} />

        <Route path="/teams" element={<TeamSelection />} />
        <Route path="/manager-profile" element={<ManagerProfile />} />

        {/* Remove duplicate route */}
        {/* <Route path="/team-settings/:id" element={<TeamSettings />} /> */}

        <Route path="/stats-test" element={<StatsViewerPage />} />
        <Route path="/stats-update" element={<StatsEditorPage />} />

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
