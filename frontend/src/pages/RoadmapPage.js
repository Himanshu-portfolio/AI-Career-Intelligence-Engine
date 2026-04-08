import React, { useState, useEffect } from 'react';
import { generateRoadmap, getRoadmap, updateProgress, getRoadmapStats } from '../lib/api';
import { Map, BookOpen, ExternalLink, ChevronDown, ChevronUp, CheckCircle, Clock, Play, RotateCcw } from 'lucide-react';

const CATEGORIES = ['ALL', 'DSA', 'BACKEND', 'SYSTEM_DESIGN', 'LANGUAGE', 'BEHAVIORAL'];
const STATUS_ICONS = {
  NOT_STARTED: <Clock size={14} />,
  IN_PROGRESS: <Play size={14} />,
  COMPLETED: <CheckCircle size={14} />,
  NEEDS_REVIEW: <RotateCcw size={14} />,
};

export default function RoadmapPage() {
  const userId = localStorage.getItem('userId');
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('ALL');
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const cat = activeTab === 'ALL' ? null : activeTab;
      const [roadmapRes, statsRes] = await Promise.all([
        getRoadmap(userId, cat),
        getRoadmapStats(userId),
      ]);
      const roadmapData = roadmapRes.data?.data || roadmapRes.data || roadmapRes;
      const statsData = statsRes.data?.data || statsRes.data || statsRes;
      setItems(Array.isArray(roadmapData) ? roadmapData : []);
      setStats(statsData || {});
    } catch (err) {
      console.error('Load error:', err);
      setItems([]);
      setStats({});
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [userId, activeTab]); // eslint-disable-line

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRoadmap(userId);
      await new Promise(r => setTimeout(r, 500)); // Wait for DB commit
      await loadData();
    } catch (err) {
      alert('Generation failed: ' + (err.response?.data?.error || err.message));
    }
    setGenerating(false);
  };

  const handleStatusChange = async (itemId, status) => {
    try {
      await updateProgress(itemId, { status });
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
    } catch {}
  };

  if (!userId) return <div className="empty-state"><h3>Upload your resume first</h3></div>;

  // Group items by phase and week
  const grouped = {};
  items.forEach(item => {
    const key = `${item.phase} (Week ${item.week_number})`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title"><Map size={24} /> Preparation Roadmap</div>
          <div className="page-subtitle">AI-generated personalized learning path</div>
        </div>
        <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : items.length ? 'Regenerate Roadmap' : 'Generate Roadmap'}
        </button>
      </div>

      {/* Stats */}
      {Object.keys(stats).length > 0 && (
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {Object.entries(stats).map(([cat, s]) => (
            <div key={cat} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{cat}</div>
              <div className="progress-bar" style={{ marginBottom: 6 }}>
                <div className="progress-fill" style={{
                  width: `${s.completion_pct}%`,
                  background: cat === 'DSA' ? 'var(--orange)' : cat === 'BACKEND' ? 'var(--blue)' : 'var(--primary)',
                }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {s.completed}/{s.total} done ({s.completion_pct}%)
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Tabs */}
      <div className="tabs">
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tab ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}>
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading roadmap...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No roadmap generated yet</h3>
          <p>Click "Generate Roadmap" to create your personalized preparation plan.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([phase, phaseItems]) => (
          <div key={phase} className="card" style={{ marginBottom: 16 }}>
            <div className="card-title" style={{ marginBottom: 16 }}>{phase}</div>
            {phaseItems.map(item => (
              <RoadmapItem
                key={item.id}
                item={item}
                expanded={expanded === item.id}
                onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}

function RoadmapItem({ item, expanded, onToggle, onStatusChange }) {
  const diffColor = item.difficulty === 'easy' ? 'var(--green)'
    : item.difficulty === 'medium' ? 'var(--yellow)' : 'var(--red)';

  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
      <div className="expandable-header" onClick={onToggle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: statusColor(item.status) }}>{STATUS_ICONS[item.status]}</span>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{item.topic}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {item.category} · <span style={{ color: diffColor }}>{item.difficulty}</span> · {item.estimated_hours}h
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            className="select"
            style={{ width: 140, padding: '4px 8px', fontSize: 12 }}
            value={item.status}
            onClick={e => e.stopPropagation()}
            onChange={e => onStatusChange(item.id, e.target.value)}
          >
            <option value="NOT_STARTED">Not Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="NEEDS_REVIEW">Needs Review</option>
          </select>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {expanded && (
        <div style={{ paddingLeft: 32, paddingTop: 12 }}>
          {/* Subtopics */}
          {item.subtopics?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="form-label">Subtopics</div>
              <div className="tag-list">
                {item.subtopics.map((s, i) => <span key={i} className="tag">{s}</span>)}
              </div>
            </div>
          )}

          {/* Resources */}
          {item.resources?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="form-label">Resources</div>
              {item.resources.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noreferrer" className="resource-link">
                  <TypeBadge type={r.type} />
                  <span style={{ flex: 1 }}>{r.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.source}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          )}

          {/* Practice Problems */}
          {item.practice_problems?.length > 0 && (
            <div>
              <div className="form-label">Practice Problems</div>
              {item.practice_problems.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="noreferrer" className="resource-link">
                  <span className={`badge ${p.difficulty === 'easy' ? 'badge-green' : p.difficulty === 'medium' ? 'badge-yellow' : 'badge-red'}`}
                    style={{ fontSize: 10, padding: '2px 6px' }}>
                    {p.difficulty}
                  </span>
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.platform}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }) {
  const colors = { video: 'badge-red', article: 'badge-blue', doc: 'badge-purple', practice: 'badge-green' };
  return <span className={`badge ${colors[type] || 'badge-blue'}`} style={{ fontSize: 10, padding: '2px 6px' }}>{type}</span>;
}

function statusColor(status) {
  return status === 'COMPLETED' ? 'var(--green)'
    : status === 'IN_PROGRESS' ? 'var(--blue)'
    : status === 'NEEDS_REVIEW' ? 'var(--yellow)' : 'var(--text-muted)';
}
