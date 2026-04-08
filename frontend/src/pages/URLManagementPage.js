import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Edit2, Save, X } from 'lucide-react';
import api from '../lib/api';

export default function URLManagementPage() {
  const userId = localStorage.getItem('userId');
  const [invalidUrls, setInvalidUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editUrl, setEditUrl] = useState('');

  useEffect(() => {
    if (userId) loadInvalidUrls();
  }, [userId]);

  const loadInvalidUrls = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/roadmap/${userId}/invalid-urls`);
      setInvalidUrls(res.data.data || []);
    } catch (err) {
      console.error('Error loading invalid URLs:', err);
    }
    setLoading(false);
  };

  const handleUpdateUrl = async (itemId, resourceIndex, newUrl) => {
    try {
      await api.put(`/roadmap/resource/${itemId}/url?resource_index=${resourceIndex}&new_url=${encodeURIComponent(newUrl)}`);
      setEditingId(null);
      await loadInvalidUrls();
    } catch (err) {
      alert('Error updating URL: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Resource URL Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Update broken or invalid resource links in your roadmap</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : invalidUrls.length === 0 ? (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '24px', 
          borderRadius: '8px', 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <CheckCircle size={20} style={{ color: 'var(--green)' }} />
          <span>All resource URLs are valid!</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {invalidUrls.map((item, idx) => (
            <div key={idx} style={{ 
              background: 'var(--bg-secondary)', 
              padding: '16px', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--red)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                <AlertCircle size={20} style={{ color: 'var(--red)', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.topic}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.resource.title} ({item.resource.source})
                  </div>
                </div>
              </div>

              {editingId === `${item.item_id}-${item.resource_index}` ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="Enter new URL"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}
                  />
                  <button
                    onClick={() => handleUpdateUrl(item.item_id, item.resource_index, editUrl)}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--green)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Save size={14} /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <code style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    overflow: 'auto',
                    maxHeight: '60px'
                  }}>
                    {item.resource.url}
                  </code>
                  <button
                    onClick={() => {
                      setEditingId(`${item.item_id}-${item.resource_index}`);
                      setEditUrl(item.resource.url);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
