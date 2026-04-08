import React, { useState } from 'react';
import { getCompanyIntel } from '../lib/api';
import { Building2, Search, Clock, Target, BookOpen } from 'lucide-react';

const POPULAR = ['Amazon', 'Flipkart', 'Razorpay', 'Google', 'Microsoft', 'Uber', 'Swiggy', 'PhonePe', 'Zerodha', 'Atlassian'];

export default function CompanyIntelPage() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Backend Engineer');
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (name) => {
    const target = name || company;
    if (!target.trim()) return;
    setCompany(target);
    setLoading(true);
    try {
      const { data } = await getCompanyIntel(target, role);
      setIntel(data);
    } catch (err) {
      alert('Failed: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Building2 size={24} /> Company Intelligence</div>
        <div className="page-subtitle">AI-analyzed interview patterns and preparation strategies</div>
      </div>

      {/* Search */}
      <div className="card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input className="input" placeholder="Company name..." value={company}
            onChange={e => setCompany(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <select className="select" style={{ width: 200 }} value={role}
            onChange={e => setRole(e.target.value)}>
            <option>Backend Engineer</option>
            <option>Full Stack Engineer</option>
            <option>SDE-1</option>
            <option>SDE-2</option>
          </select>
          <button className="btn btn-primary" onClick={() => handleSearch()} disabled={loading}>
            <Search size={16} /> {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {POPULAR.map(c => (
            <button key={c} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}
              onClick={() => handleSearch(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading"><div className="spinner" /> Analyzing {company}...</div>}

      {intel && !loading && (
        <>
          {/* Interview Rounds */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <Clock size={18} /> Interview Process — {intel.company}
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
              {(intel.interview_rounds || []).map((round, i) => (
                <div key={i} style={{
                  minWidth: 200, padding: 16, background: 'var(--bg)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
                    Round {i + 1}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{round.round}</div>
                  <span className="badge badge-purple">{round.type}</span>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    {round.duration_minutes} min
                  </div>
                  <div style={{ fontSize: 13, marginTop: 8 }}>{round.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DSA Patterns */}
          {intel.dsa_patterns && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}><Target size={18} /> DSA Patterns</div>
              <div className="grid-3">
                <div>
                  <div className="form-label">Top Topics</div>
                  <div className="tag-list">
                    {(intel.dsa_patterns.top_topics || []).map(t => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="form-label">Common Patterns</div>
                  <div className="tag-list">
                    {(intel.dsa_patterns.common_patterns || []).map(p => (
                      <span key={p} className="tag">{p}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="form-label">Difficulty Distribution</div>
                  {intel.dsa_patterns.difficulty_distribution && (
                    <div style={{ fontSize: 13 }}>
                      <div>🟢 Easy: {intel.dsa_patterns.difficulty_distribution.easy}%</div>
                      <div>🟡 Medium: {intel.dsa_patterns.difficulty_distribution.medium}%</div>
                      <div>🔴 Hard: {intel.dsa_patterns.difficulty_distribution.hard}%</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* System Design & LLD */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>System Design Topics</div>
              <div className="tag-list">
                {(intel.system_design_topics || []).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>LLD Topics</div>
              <div className="tag-list">
                {(intel.lld_topics || []).map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          </div>

          {/* Behavioral & Culture */}
          <div className="grid-2">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Behavioral Focus</div>
              <ul style={{ paddingLeft: 20, fontSize: 14 }}>
                {(intel.behavioral_focus || []).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Culture & Values</div>
              <div className="tag-list">
                {(intel.culture_values || []).map(v => <span key={v} className="tag">{v}</span>)}
              </div>
            </div>
          </div>

          {/* Prep Tips */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>
              <BookOpen size={18} /> Preparation Tips
              <span className="badge badge-blue" style={{ marginLeft: 12 }}>
                ~{intel.estimated_prep_weeks} weeks
              </span>
            </div>
            <ul style={{ paddingLeft: 20, fontSize: 14 }}>
              {(intel.preparation_tips || []).map((t, i) => <li key={i} style={{ marginBottom: 6 }}>{t}</li>)}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
