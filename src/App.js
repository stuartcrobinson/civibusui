import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import CityPage from './components/CityPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import MethodologyPage from './components/MethodologyPage';

function App() {
  return (
    <BrowserRouter>
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