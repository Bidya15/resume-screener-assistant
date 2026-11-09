import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import NewAnalysis from '../pages/NewAnalysis';
import AnalysisResults from '../pages/AnalysisResults';
import AnalysisHistory from '../pages/AnalysisHistory';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analysis/new" element={<NewAnalysis />} />
        <Route path="analyses/new" element={<NewAnalysis />} />
        <Route path="analysis/history" element={<AnalysisHistory />} />
        <Route path="analyses" element={<AnalysisHistory />} />
        <Route path="analysis/:id" element={<AnalysisResults />} />
        <Route path="analyses/:id" element={<AnalysisResults />} />
        <Route path="settings" element={<Settings />} />
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

