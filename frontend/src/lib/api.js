import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
});

// ── Profile ──
export const uploadResume = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return api.post('/profile/resume', fd);
};
export const getProfile = (id) => api.get(`/profile/${id}`);
export const setupProfile = (id, data) => api.put(`/profile/${id}/setup`, data);

// ── Jobs ──
export const matchJob = (userId, data) => api.post(`/jobs/${userId}/match`, data);
export const listJobs = (userId) => api.get(`/jobs/${userId}`);
export const scrapeJobs = (platform, slug) => api.get(`/jobs/scrape/${platform}/${slug}`);
export const fetchJobDescription = (url) => api.post(`/jobs/fetch-description?url=${encodeURIComponent(url)}`);

// ── Roadmap ──
export const generateRoadmap = (userId) => api.post(`/roadmap/${userId}/generate`);
export const getRoadmap = (userId, category) =>
  api.get(`/roadmap/${userId}`, { params: category ? { category } : {} });
export const updateProgress = (itemId, data) => api.put(`/roadmap/item/${itemId}/progress`, data);
export const getRoadmapStats = (userId) => api.get(`/roadmap/${userId}/stats`);
export const getInvalidUrls = (userId) => api.get(`/roadmap/${userId}/invalid-urls`);
export const updateResourceUrl = (itemId, resourceIndex, newUrl) =>
  api.put(`/roadmap/resource/${itemId}/url?resource_index=${resourceIndex}&new_url=${encodeURIComponent(newUrl)}`);

// ── Job Scraper ──
export const scrapeCompanyJobs = (companyName, customUrl) =>
  api.post(`/jobs/scrape-company?company_name=${companyName}${customUrl ? `&custom_url=${encodeURIComponent(customUrl)}` : ''}`);
export const matchJobsToSkills = (userId) => api.post(`/jobs/match-to-skills?user_id=${userId}`);
export const addCustomCompany = (companyName, careerUrl) =>
  api.post(`/jobs/add-company?company_name=${companyName}&career_url=${encodeURIComponent(careerUrl)}`);

// ── Company Intel ──
export const getCompanyIntel = (name, role) =>
  api.get(`/company/${name}/intel`, { params: { role } });

// ── Mock Interview ──
export const generateQuestion = (userId, data) => api.post(`/mock/${userId}/question`, data);
export const evaluateAnswer = (sessionId, data) => api.post(`/mock/${sessionId}/evaluate`, data);

// ── Analytics ──
export const getDashboard = (userId) => api.get(`/analytics/${userId}/dashboard`);

export default api;
