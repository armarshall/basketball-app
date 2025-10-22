import { BrowserRouter, Routes, Route } from "react-router-dom";
import MenuAppBar from "./components/MenuAppBar";
import Home from "./pages/Home";
import Rules from "./pages/Rules";
import Team from "./pages/Team";
import Standings from "./pages/Standings";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";

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
        <Route path="/login" element={<LogIn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
