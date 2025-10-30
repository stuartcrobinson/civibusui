import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import './App.css';
import StateSelectionPage from './components/StateSelectionPage';
import HomePage from './components/HomePage';
import CityPage from './components/CityPage';
import NYCContestList from './components/NYCContestList';
import NYCContestPage from './components/NYCContestPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import MethodologyPage from './components/MethodologyPage';
import PublicFundingTest from './pages/PublicFundingTest';
import { initGA, logPageView } from './utils/analytics';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    logPageView();
  }, [location]);

  return null;
}

function LegacyCityRedirect() {
  const { geoName } = useParams();
  return <Navigate to={`/nc/${geoName}`} replace />;
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<StateSelectionPage />} />
        <Route path="/nc" element={<HomePage />} />
        <Route path="/nc/:geoName" element={<CityPage />} />
        <Route path="/nyc" element={<NYCContestList />} />
        <Route path="/nyc/:contestSlug" element={<NYCContestPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />

        {/* testing */}
        <Route path="/public-funding-test" element={<PublicFundingTest />} />
        
        {/* Redirect old URLs */}
        <Route path="/geo_name/:geoName" element={<LegacyCityRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;