import React, { useState, useEffect, useCallback } from 'react';
import { uploadResume, getProfile, setupProfile } from '../lib/api';
import { Upload, User, Target, CheckCircle } from 'lucide-react';

export default function ResumePage() {
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [setup, setSetup] = useState({
    target_role: 'Backend Engineer',
    target_companies: ['Amazon', 'Flipkart', 'Razorpay'],
    dsa_level: 2, backend_level: 6, system_design_level: 4, hours_per_week: 15,
  });

  const loadProfile = useCallback(async (id) => {
    try {
      const { data } = await getProfile(id);
      setProfile(data);
      if (data.target_role) {
        setSetup({
          target_role: data.target_role || 'Backend Engineer',
          target_companies: data.target_companies || ['Amazon', 'Flipkart', 'Razorpay'],
          dsa_level: data.dsa_level ?? 2,
          backend_level: data.backend_level ?? 6,
          system_design_level: data.system_design_level ?? 4,
          hours_per_week: data.hours_per_week ?? 15,
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (userId) loadProfile(userId);
  }, [userId, loadProfile]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await uploadResume(file);
      localStorage.setItem('userId', data.user_id);
      setUserId(data.user_id);
      setProfile({ ...data, parsed_profile: data.profile });
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    }
    setUploading(false);
  };

  const handleSaveSetup = async () => {
    setSaving(true);
    try {
      await setupProfile(userId, {
        ...setup,
        target_companies: typeof setup.target_companies === 'string'
          ? setup.target_companies.split(',').map(s => s.trim())
          : setup.target_companies,
      });
      await loadProfile(userId);
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
    setSaving(false);
  };

  const parsed = profile?.parsed_profile;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Resume & Profile</div>
        <div className="page-subtitle">Upload your resume and configure your targets</div>
      </div>

      {/* Upload Section */}
      <div className="card">
        <div className="card-header">
          <span className="card-title"><Upload size={18} /> Upload Resume</span>
          {userId && <span className="badge badge-green"><CheckCircle size={12} /> Profile Active</span>}
        </div>
        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          {uploading ? 'Analyzing...' : 'Choose PDF / DOCX'}
          <input type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} hidden disabled={uploading} />
        </label>
        {userId && <span style={{ marginLeft: 12, fontSize: 13, color: 'var(--text-muted)' }}>ID: {userId}</span>}
      </div>

      {/* Parsed Profile */}
      {parsed && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}><User size={18} /> Analyzed Profile</div>
          <div className="grid-2">
            <div>
              <div className="form-label">Name</div>
              <div>{parsed.name}</div>
            </div>
            <div>
              <div className="form-label">Experience</div>
              <div>{parsed.years_of_experience} years — {parsed.current_role} at {parsed.current_company}</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="form-label">Summary</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{parsed.summary}</div>
          </div>

          <div className="grid-2" style={{ marginTop: 16 }}>
            <div>
              <div className="form-label">Primary Skills</div>
              <div className="tag-list">
                {(parsed.primary_skills || []).map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
            <div>
              <div className="form-label">Languages</div>
              <div className="tag-list">
                {(parsed.languages || []).map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 16 }}>
            <div>
              <div className="form-label">Frameworks</div>
              <div className="tag-list">
                {(parsed.frameworks || []).map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
            <div>
              <div className="form-label">Cloud</div>
              <div className="tag-list">
                {(parsed.cloud_platforms || []).map(s => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 16 }}>
            <div>
              <div className="form-label">Strengths</div>
              <ul style={{ paddingLeft: 20, fontSize: 14 }}>
                {(parsed.strengths || []).map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div>
              <div className="form-label">Gaps</div>
              <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--yellow)' }}>
                {(parsed.gaps || []).map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
          </div>

          <div className="grid-2" style={{ marginTop: 16 }}>
            <div>
              <div className="form-label">DSA Signals</div>
              <SignalBadge value={parsed.dsa_signals} />
            </div>
            <div>
              <div className="form-label">System Design Signals</div>
              <SignalBadge value={parsed.system_design_signals} />
            </div>
          </div>
        </div>
      )}

      {/* Target Setup */}
      {userId && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}><Target size={18} /> Target Configuration</div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input className="input" value={setup.target_role}
                onChange={e => setSetup({ ...setup, target_role: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Target Companies (comma-separated)</label>
              <input className="input"
                value={Array.isArray(setup.target_companies) ? setup.target_companies.join(', ') : setup.target_companies}
                onChange={e => setSetup({ ...setup, target_companies: e.target.value })} />
            </div>
          </div>
          <div className="grid-4">
            <SliderField label="DSA Level" value={setup.dsa_level}
              onChange={v => setSetup({ ...setup, dsa_level: v })} />
            <SliderField label="Backend Level" value={setup.backend_level}
              onChange={v => setSetup({ ...setup, backend_level: v })} />
            <SliderField label="System Design" value={setup.system_design_level}
              onChange={v => setSetup({ ...setup, system_design_level: v })} />
            <SliderField label="Hours/Week" value={setup.hours_per_week} max={40}
              onChange={v => setSetup({ ...setup, hours_per_week: v })} />
          </div>
          <button className="btn btn-primary" onClick={handleSaveSetup} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      )}
    </div>
  );
}

function SignalBadge({ value }) {
  const cls = value === 'strong' ? 'badge-green' : value === 'moderate' ? 'badge-yellow' : 'badge-red';
  return <span className={`badge ${cls}`}>{value || 'none'}</span>;
}

function SliderField({ label, value, onChange, max = 10 }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}: {value}/{max}</label>
      <input type="range" min={0} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--primary)' }} />
    </div>
  );
}
