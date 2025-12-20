import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { RoutinesPage } from './pages/RoutinesPage';
import { ClassesPage } from './pages/ClassesPage';
import { NutritionPage } from './pages/NutritionPage';
import { RecommendationsPage } from './pages/RecommendationsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;