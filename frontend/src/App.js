import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ResumePage from './pages/ResumePage';
import JobsPage from './pages/JobsPage';
import RoadmapPage from './pages/RoadmapPage';
import CompanyIntelPage from './pages/CompanyIntelPage';
import MockInterviewPage from './pages/MockInterviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import URLManagementPage from './pages/URLManagementPage';
import JobScraperPage from './pages/JobScraperPage';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs-scraper" element={<JobScraperPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/roadmap/urls" element={<URLManagementPage />} />
          <Route path="/company" element={<CompanyIntelPage />} />
          <Route path="/mock" element={<MockInterviewPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
