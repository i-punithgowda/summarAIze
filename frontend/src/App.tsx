import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { PRSummary } from "./pages/PRSummary";
import { GitAssistant } from "./pages/GitAssistant";
import { NavBar } from "./components/NavBar";

const App: React.FC = () => (
    <BrowserRouter>
        <NavBar />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pr-summary" element={<PRSummary />} />
            <Route path="/git-assistant" element={<GitAssistant />} />
        </Routes>
    </BrowserRouter>
);

export default App; 