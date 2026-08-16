import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GitAssistant } from "./pages/GitAssistant";
import { NavBar } from "./components/NavBar";

const App: React.FC = () => (
    <BrowserRouter>
        <div className="min-h-screen bg-stone-100">
            <NavBar />
            <Routes>
                <Route path="/" element={<GitAssistant />} />
            </Routes>
        </div>
    </BrowserRouter>
);

export default App;
