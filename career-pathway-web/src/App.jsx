import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SharedAuthProvider } from './auth/AuthContext';
import { CareerProvider } from './context/CareerContext';
import Layout from './components/Layout';
import Dashboard from './pages/career/Dashboard';
import Analyzer from './pages/career/Analyzer';
import Roadmap from './pages/career/Roadmap';
import GraphExplorer from './pages/career/GraphExplorer';
import Landing from './pages/career/Landing';
import Login from './auth/Login';
import Register from './auth/Register';
import Home from './pages/Home';
import './App.css';

const LayoutRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/analyzer" element={<Analyzer />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/roadmap/:pathwayId" element={<Roadmap />} />
      <Route path="/graph" element={<GraphExplorer />} />
      
      {/* Deep-link career alias routes */}
      <Route path="/career/dashboard" element={<Dashboard />} />
      <Route path="/career/analyzer" element={<Analyzer />} />
      <Route path="/career/roadmap" element={<Roadmap />} />
      <Route path="/career/roadmap/:pathwayId" element={<Roadmap />} />
      <Route path="/career/graph" element={<GraphExplorer />} />

      {/* Default redirect for layout routes */}
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
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/career" element={<Landing />} />
            <Route path="/*" element={<LayoutRoutes />} />
          </Routes>
        </CareerProvider>
      </SharedAuthProvider>
    </ThemeProvider>
  );
}

export default App;
