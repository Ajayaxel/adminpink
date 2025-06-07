// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Layout from "./Layout";
// we'll create this

const App = () => {
  return (
   
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <Layout />
          }
        />
      </Routes>
    </Router>
   
    
    );
};

export default App;









