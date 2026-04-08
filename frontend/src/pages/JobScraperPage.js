import React, { useState } from 'react';
import { Search, Plus, ExternalLink, Zap, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const POPULAR_COMPANIES = [
  'google', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'uber', 'airbnb',
  'stripe', 'github', 'gitlab', 'shopify', 'twilio', 'datadog', 'figma'
];

export default function JobScraperPage() {
  const userId = localStorage.getItem('userId');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [customCompany, setCustomCompany] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleToggleCompany = (company) => {
    setSelectedCompanies(prev =>
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const handleAddCustomCompany = async () => {
    if (!customCompany || !customUrl) {
      alert('Please enter company name and career URL');
      return;
    }

    try {
      await api.post(`/jobs/add-company?company_name=${customCompany}&career_url=${encodeURIComponent(customUrl)}`);
      setSelectedCompanies([...selectedCompanies, customCompany.toLowerCase()]);
      setCustomCompany('');
      setCustomUrl('');
      setShowCustomForm(false);
    } catch (err) {
      alert('Error adding company: ' + err.message);
    }
  };

  const handleScrapeJobs = async () => {
    if (selectedCompanies.length === 0) {
      alert('Please select at least one company');
      return;
    }

    setLoading(true);
    try {
      const allJobs = [];
      for (const company of selectedCompanies) {
        const res = await api.post(`/jobs/scrape-company?company_name=${company}`);
        allJobs.push(...(res.data.data || []));
      }

      // Match to skills
      const matchRes = await api.post(`/jobs/match-to-skills?user_id=${userId}`);
      const matched = matchRes.data.data || [];

      // Combine and deduplicate
      const combined = [...allJobs, ...matched];
      const unique = Array.from(new Map(combined.map(j => [j.url, j])).values());
      setJobs(unique.sort((a, b) => (b.match_score || 0) - (a.match_score || 0)));
    } catch (err) {
      alert('Error scraping jobs: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Job Portal Scraper</h1>
        <p style={{ color: 'var(--text-muted)' }}>Scrape jobs from company career pages and match to your skills</p>
      </div>

      {/* Company Selection */}
      <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '8px', marginBottom: '24px' }}>
        <div style={{ fontWeight: 600, marginBottom: '16px' }}>Select Companies</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          {POPULAR_COMPANIES.map(company => (
            <button
              key={company}
              onClick={() => handleToggleCompany(company)}
              style={{
                padding: '10px 12px',
                background: selectedCompanies.includes(company) ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: selectedCompanies.includes(company) ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '13px',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              {company}
            </button>
          ))}
        </div>

        {/* Custom Company Form */}
        {showCustomForm ? (
          <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Company name"
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
            <input
              type="text"
              placeholder="Career page URL"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              style={{
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAddCustomCompany}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'var(--green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Add Company
              </button>
              <button
                onClick={() => setShowCustomForm(false)}
                style={{
                  padding: '10px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomForm(true)}
            style={{
              padding: '10px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px'
            }}
          >
            <Plus size={14} /> Add Custom Company
          </button>
        )}
      </div>

      {/* Scrape Button */}
      <button
        onClick={handleScrapeJobs}
        disabled={loading || selectedCompanies.length === 0}
        style={{
          width: '100%',
          padding: '12px',
          background: loading ? 'var(--text-muted)' : 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}
      >
        <Zap size={16} /> {loading ? 'Scraping...' : 'Scrape & Match Jobs'}
      </button>

      {/* Jobs List */}
      {jobs.length > 0 && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Found {jobs.length} Jobs</div>
          {jobs.map((job, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: job.match_score ? `4px solid var(--green)` : '4px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{job.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {job.company} {job.source === 'web_scrape' && '• Web Scraped'}
                </div>
                {job.match_score && (
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: 'var(--green)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600
                  }}>
                    {job.match_score}% Match
                  </div>
                )}
              </div>
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '8px 12px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap'
                }}
              >
                Apply <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && selectedCompanies.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          color: 'var(--text-muted)'
        }}>
          <AlertCircle size={18} />
          <span>Click "Scrape & Match Jobs" to find opportunities</span>
        </div>
      )}
    </div>
  );
}
