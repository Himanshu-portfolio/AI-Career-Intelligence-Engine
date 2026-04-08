import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard, getProfile } from '../lib/api';
import { Target, Briefcase, BookOpen, Swords, TrendingUp, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    Promise.all([
      getDashboard(userId).then(r => setData(r.data)),
      getProfile(userId).then(r => setProfile(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return (
      <div className="empty-state">
        <Target size={48} />
        <h3>Welcome to AI Career Intelligence Engine</h3>
        <p>Upload your resume to get started with personalized job matching and interview prep.</p>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/resume')}>
          <ArrowRight size={16} /> Upload Resume
        </button>
      </div>
    );
  }

  if (loading) return <div className="loading"><div className="spinner" /> Loading dashboard...</div>;

  const readiness = data?.readiness || {};
  const jobs = data?.jobs || {};
  const roadmap = data?.roadmap || {};
  const mock = data?.mock_interviews || {};

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-subtitle">
          {profile?.name ? `Welcome back, ${profile.name}` : 'Your career intelligence overview'}
        </div>
      </div>

      {/* Readiness Scores */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <ReadinessCard label="DSA" value={readiness.dsa || 0} color="var(--orange)" />
        <ReadinessCard label="Backend" value={readiness.backend || 0} color="var(--blue)" />
        <ReadinessCard label="System Design" value={readiness.system_design || 0} color="var(--primary)" />
        <ReadinessCard label="Overall" value={readiness.overall || 0} color="var(--green)" />
      </div>

      {/* Stats Row */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-card" onClick={() => navigate('/jobs')} style={{ cursor: 'pointer' }}>
          <Briefcase size={24} style={{ color: 'var(--primary)', marginBottom: 8 }} />
          <div className="stat-value">{jobs.total || 0}</div>
          <div className="stat-label">Jobs Matched</div>
          {jobs.apply_now_count > 0 && (
            <span className="badge badge-green" style={{ marginTop: 8 }}>
              {jobs.apply_now_count} ready to apply
            </span>
          )}
        </div>
        <div className="card stat-card" onClick={() => navigate('/roadmap')} style={{ cursor: 'pointer' }}>
          <BookOpen size={24} style={{ color: 'var(--green)', marginBottom: 8 }} />
          <div className="stat-value">
            {Object.values(roadmap).reduce((a, c) => a + (c.completed || 0), 0)}
            <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>
              /{Object.values(roadmap).reduce((a, c) => a + (c.total || 0), 0)}
            </span>
          </div>
          <div className="stat-label">Topics Completed</div>
        </div>
        <div className="card stat-card" onClick={() => navigate('/mock')} style={{ cursor: 'pointer' }}>
          <Swords size={24} style={{ color: 'var(--yellow)', marginBottom: 8 }} />
          <div className="stat-value">{mock.total || 0}</div>
          <div className="stat-label">Mock Sessions</div>
          {mock.avg_score > 0 && (
            <div className="stat-label">Avg Score: {mock.avg_score}</div>
          )}
        </div>
      </div>

      {/* Roadmap Progress */}
      {Object.keys(roadmap).length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Preparation Progress</span>
            <button className="btn btn-secondary" onClick={() => navigate('/roadmap')}>
              View Roadmap <ArrowRight size={14} />
            </button>
          </div>
          {Object.entries(roadmap).map(([cat, stats]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{cat}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {stats.completed}/{stats.total} ({stats.completion_pct}%)
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${stats.completion_pct}%`,
                    background: cat === 'DSA' ? 'var(--orange)' : cat === 'BACKEND' ? 'var(--blue)' : 'var(--primary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/jobs')}>
            <Briefcase size={16} /> Match a Job
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/mock')}>
            <Swords size={16} /> Start Mock Interview
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/company')}>
            <TrendingUp size={16} /> Company Intel
          </button>
        </div>
      </div>
    </div>
  );
}

function ReadinessCard({ label, value, color }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 20 }}>
      <div
        className="score-circle"
        style={{
          borderColor: color,
          color,
          margin: '0 auto 12px',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Readiness</div>
    </div>
  );
}
