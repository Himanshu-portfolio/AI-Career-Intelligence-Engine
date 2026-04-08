import React, { useState, useEffect } from 'react';
import { getDashboard, getRoadmapStats } from '../lib/api';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#f97316'];

export default function AnalyticsPage() {
  const userId = localStorage.getItem('userId');
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    Promise.all([
      getDashboard(userId).then(r => setData(r.data)),
      getRoadmapStats(userId).then(r => setStats(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return <div className="empty-state"><h3>Upload your resume first</h3></div>;
  if (loading) return <div className="loading"><div className="spinner" /> Loading analytics...</div>;
  if (!data) return <div className="empty-state"><h3>No data yet. Start using the platform!</h3></div>;

  const readiness = data.readiness || {};
  const radarData = [
    { subject: 'DSA', value: readiness.dsa || 0 },
    { subject: 'Backend', value: readiness.backend || 0 },
    { subject: 'System Design', value: readiness.system_design || 0 },
    { subject: 'Mock Score', value: data.mock_interviews?.avg_score || 0 },
  ];

  const roadmapBarData = Object.entries(stats || {}).map(([cat, s]) => ({
    category: cat,
    completed: s.completed || 0,
    in_progress: s.in_progress || 0,
    remaining: (s.total || 0) - (s.completed || 0) - (s.in_progress || 0),
  }));

  const pieData = [
    { name: 'Apply Now', value: data.jobs?.apply_now_count || 0 },
    { name: 'Other', value: Math.max(0, (data.jobs?.total || 0) - (data.jobs?.apply_now_count || 0)) },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><BarChart3 size={24} /> Performance Analytics</div>
        <div className="page-subtitle">Track your interview readiness across all dimensions</div>
      </div>

      {/* Overall Readiness */}
      <div className="card" style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Overall Interview Readiness</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: readinessColor(readiness.overall) }}>
          {readiness.overall || 0}%
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          {readiness.overall >= 70 ? '🟢 Ready to interview' :
           readiness.overall >= 40 ? '🟡 Getting there — keep grinding' :
           '🔴 More preparation needed'}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Radar Chart */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Skill Radar</div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Radar dataKey="value" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Job Match Distribution */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Job Matches</div>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="stat-card">
              <div className="stat-value">{data.jobs?.total || 0}</div>
              <div className="stat-label">Total Matched</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--green)' }}>{data.jobs?.apply_now_count || 0}</div>
              <div className="stat-label">Ready to Apply</div>
            </div>
          </div>
          {data.jobs?.total > 0 && (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Roadmap Progress Bar Chart */}
      {roadmapBarData.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Roadmap Progress by Category</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roadmapBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="completed" stackId="a" fill="var(--green)" name="Completed" />
              <Bar dataKey="in_progress" stackId="a" fill="var(--yellow)" name="In Progress" />
              <Bar dataKey="remaining" stackId="a" fill="var(--border)" name="Remaining" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed Stats */}
      <div className="grid-4">
        <StatCard label="DSA Readiness" value={readiness.dsa} color="var(--orange)" />
        <StatCard label="Backend Readiness" value={readiness.backend} color="var(--blue)" />
        <StatCard label="System Design" value={readiness.system_design} color="var(--primary)" />
        <StatCard label="Mock Avg Score" value={data.mock_interviews?.avg_score || 0} color="var(--yellow)" />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card stat-card">
      <div className="score-circle" style={{ borderColor: color, color, margin: '0 auto 12px' }}>
        {Math.round(value || 0)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div className="progress-bar" style={{ marginTop: 8 }}>
        <div className="progress-fill" style={{ width: `${value || 0}%`, background: color }} />
      </div>
    </div>
  );
}

function readinessColor(value) {
  if (value >= 70) return 'var(--green)';
  if (value >= 40) return 'var(--yellow)';
  return 'var(--red)';
}
