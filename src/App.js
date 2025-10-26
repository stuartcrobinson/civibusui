import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import CityPage from './components/CityPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import MethodologyPage from './components/MethodologyPage';
import { initGA, logPageView } from './utils/analytics';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    logPageView();
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/geo_name/:geoName" element={<CityPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;