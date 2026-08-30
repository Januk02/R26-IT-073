import React from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CareerProvider } from './context/CareerContext';
import './index.css';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import Roadmap from './pages/Roadmap';
import GraphExplorer from './pages/GraphExplorer';

export default function Member2Module({ onBack }) {
  return (
    <ThemeProvider>
      <CareerProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<Landing onBackToPortal={onBack} />} />
            <Route path="/landing" element={<Landing onBackToPortal={onBack} />} />
            <Route path="/dashboard" element={<Layout onBackToPortal={onBack}><Dashboard /></Layout>} />
            <Route path="/analyzer" element={<Layout onBackToPortal={onBack}><Analyzer /></Layout>} />
            <Route path="/roadmap" element={<Layout onBackToPortal={onBack}><Roadmap /></Layout>} />
            <Route path="/roadmap/:pathwayId" element={<Layout onBackToPortal={onBack}><Roadmap /></Layout>} />
            <Route path="/graph" element={<Layout onBackToPortal={onBack}><GraphExplorer /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MemoryRouter>
      </CareerProvider>
    </ThemeProvider>
  );
}
