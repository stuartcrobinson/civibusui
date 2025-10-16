import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import CityPage from './components/CityPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/:geoName" element={<CityPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;