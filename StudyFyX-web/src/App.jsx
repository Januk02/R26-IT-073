import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { SharedAuthProvider } from './modules/auth/AuthContext';
import { CareerProvider } from './modules/career-pathway/context/CareerContext';

// Shared Auth & Portal
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import Home from './modules/portal/Home';

// Career Pathway Component (Member 2)
import Layout from './modules/career-pathway/components/Layout';
import Landing from './modules/career-pathway/pages/Landing';
import Dashboard from './modules/career-pathway/pages/Dashboard';
import Analyzer from './modules/career-pathway/pages/Analyzer';
import Roadmap from './modules/career-pathway/pages/Roadmap';
import GraphExplorer from './modules/career-pathway/pages/GraphExplorer';

import './App.css';

const CareerLayoutRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analyzer" element={<Analyzer />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/roadmap/:pathwayId" element={<Roadmap />} />
      <Route path="/graph" element={<GraphExplorer />} />

      {/* Nested aliases for deep-linking from portal/landing */}
      <Route path="/career/dashboard" element={<Dashboard />} />
      <Route path="/career/analyzer" element={<Analyzer />} />
      <Route path="/career/roadmap" element={<Roadmap />} />
      <Route path="/career/roadmap/:pathwayId" element={<Roadmap />} />
      <Route path="/career/graph" element={<GraphExplorer />} />

      {/* Default redirect for career workspace */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Layout>
);

function App() {
  return (
    <ThemeProvider>
      <SharedAuthProvider>
        <CareerProvider>
          <Routes>
            {/* Default entrypoint -> Central Portal */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Shared Modules */}
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Career Pathway Module */}
            <Route path="/career" element={<Landing />} />
            <Route path="/*" element={<CareerLayoutRoutes />} />
          </Routes>
        </CareerProvider>
      </SharedAuthProvider>
    </ThemeProvider>
  );
}

export default App;
