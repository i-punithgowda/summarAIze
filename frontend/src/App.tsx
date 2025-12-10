import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GitAssistant } from "./pages/GitAssistant";
import { NavBar } from "./components/NavBar";

const App: React.FC = () => (
    <BrowserRouter>
        <NavBar />
        <Routes>
            <Route path="/" element={<GitAssistant />} />
        </Routes>
    </BrowserRouter>
);

export default App; 