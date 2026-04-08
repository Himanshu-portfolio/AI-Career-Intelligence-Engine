import React, { useState, useEffect } from 'react';
import { matchJob, listJobs, scrapeJobs, fetchJobDescription } from '../lib/api';
import { Briefcase, Search, ExternalLink, ChevronDown, ChevronUp, Loader } from 'lucide-react';

export default function JobsPage() {
  const userId = localStorage.getItem('userId');
  const [jobs, setJobs] = useState([]);
  const [jobText, setJobText] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [matching, setMatching] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [scrapeSlug, setScrapeSlug] = useState('');
  const [scrapePlatform, setScrapePlatform] = useState('greenhouse');
  const [scrapedJobs, setScrapedJobs] = useState([]);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    if (userId) listJobs(userId).then(r => setJobs(r.data)).catch(() => {});
  }, [userId]);

  const handleMatch = async () => {
    if (!jobText.trim()) return;
    setMatching(true);
    try {
      await matchJob(userId, { job_text: jobText, url: jobUrl || null, source: 'manual' });
      const { data } = await listJobs(userId);
      setJobs(data);
      setJobText('');
      setJobUrl('');
    } catch (err) {
      alert('Match failed: ' + (err.response?.data?.error || err.message));
    }
    setMatching(false);
  };

  const handleScrape = async () => {
    if (!scrapeSlug.trim()) return;
    setScraping(true);
    try {
      const { data } = await scrapeJobs(scrapePlatform, scrapeSlug);
      setScrapedJobs(data);
    } catch { setScrapedJobs([]); }
    setScraping(false);
  };

  const handleImportScraped = async (job) => {
    setMatching(true);
    try {
      const { data } = await fetchJobDescription(job.url);
      await matchJob(userId, { job_text: data.description, url: job.url, source: job.source });
      const res = await listJobs(userId);
      setJobs(res.data);
    } catch (err) {
      alert('Import failed: ' + (err.response?.data?.error || err.message));
    }
    setMatching(false);
  };

  if (!userId) return <div className="empty-state"><h3>Upload your resume first</h3></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Job Matching</div>
        <div className="page-subtitle">Paste job descriptions or scrape from public boards</div>
      </div>

      {/* Manual Input */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Submit Job Description</div>
        <div className="form-group">
          <label className="form-label">Job URL (optional)</label>
          <input className="input" placeholder="https://..." value={jobUrl} onChange={e => setJobUrl(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Job Description</label>
          <textarea className="textarea" rows={8} placeholder="Paste the full job description here..."
            value={jobText} onChange={e => setJobText(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={handleMatch} disabled={matching || !jobText.trim()}>
          {matching ? <><Loader size={16} className="spinner" /> Analyzing...</> : 'Analyze & Match'}
        </button>
      </div>

      {/* Scraper */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}><Search size={18} /> Scrape Job Boards</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <select className="select" style={{ width: 160 }} value={scrapePlatform}
            onChange={e => setScrapePlatform(e.target.value)}>
            <option value="greenhouse">Greenhouse</option>
            <option value="lever">Lever</option>
          </select>
          <input className="input" placeholder="Company slug (e.g. razorpay)"
            value={scrapeSlug} onChange={e => setScrapeSlug(e.target.value)} />
          <button className="btn btn-secondary" onClick={handleScrape} disabled={scraping}>
            {scraping ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
        {scrapedJobs.length > 0 && (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              Found {scrapedJobs.length} jobs — click to import & match
            </div>
            {scrapedJobs.slice(0, 20).map((j, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: 14 }}>{j.title}</div>
                  <a href={j.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                    {j.source} <ExternalLink size={10} />
                  </a>
                </div>
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={() => handleImportScraped(j)} disabled={matching}>
                  Import & Match
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Matched Jobs */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><Briefcase size={18} /> Matched Jobs ({jobs.length})</span>
        </div>
        {jobs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            No jobs matched yet. Submit a job description above.
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="card" style={{ marginBottom: 12 }}>
              <div className="expandable-header" onClick={() => setExpanded(expanded === job.id ? null : job.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="score-circle" style={{
                    width: 48, height: 48, fontSize: 16,
                    borderColor: job.match_score >= 70 ? 'var(--green)' : job.match_score >= 50 ? 'var(--yellow)' : 'var(--red)',
                    color: job.match_score >= 70 ? 'var(--green)' : job.match_score >= 50 ? 'var(--yellow)' : 'var(--red)',
                  }}>
                    {job.match_score}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{job.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{job.company}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <PriorityBadge priority={job.priority} />
                  {job.url && <a href={job.url} target="_blank" rel="noreferrer"><ExternalLink size={14} /></a>}
                  {expanded === job.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {expanded === job.id && job.match_analysis && (
                <MatchDetails analysis={job.match_analysis} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const cls = priority === 'APPLY_NOW' ? 'badge-green'
    : priority === 'PREPARE_THEN_APPLY' ? 'badge-yellow' : 'badge-red';
  return <span className={`badge ${cls}`}>{(priority || 'SKIP').replace(/_/g, ' ')}</span>;
}

function MatchDetails({ analysis }) {
  return (
    <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div>
          <div className="form-label">Matching Skills</div>
          <div className="tag-list">
            {(analysis.matching_skills || []).map(s => (
              <span key={s} className="tag" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{s}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="form-label">Missing Skills</div>
          <div className="tag-list">
            {(analysis.missing_skills || []).map(s => (
              <span key={s} className="tag" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="grid-3" style={{ marginBottom: 16 }}>
        <ReadinessBadge label="DSA" value={analysis.dsa_readiness} />
        <ReadinessBadge label="Backend" value={analysis.backend_readiness} />
        <ReadinessBadge label="System Design" value={analysis.system_design_readiness} />
      </div>
      {analysis.action_items && (
        <div>
          <div className="form-label">Action Items</div>
          <ul style={{ paddingLeft: 20, fontSize: 14 }}>
            {analysis.action_items.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      {analysis.reasoning && (
        <div style={{ marginTop: 12, fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {analysis.reasoning}
        </div>
      )}
    </div>
  );
}

function ReadinessBadge({ label, value }) {
  const cls = value === 'ready' ? 'badge-green' : value === 'needs_work' ? 'badge-yellow' : 'badge-red';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <span className={`badge ${cls}`}>{(value || 'unknown').replace(/_/g, ' ')}</span>
    </div>
  );
}
