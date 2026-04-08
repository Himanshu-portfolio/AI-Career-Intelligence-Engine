import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, Map, Building2,
  Swords, BarChart3, Link2, Globe
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resume', icon: FileText, label: 'Resume & Profile' },
  { to: '/jobs', icon: Briefcase, label: 'Job Matching' },
  { to: '/jobs-scraper', icon: Globe, label: 'Job Scraper' },
  { to: '/roadmap', icon: Map, label: 'Prep Roadmap' },
  { to: '/roadmap/urls', icon: Link2, label: 'URL Manager' },
  { to: '/company', icon: Building2, label: 'Company Intel' },
  { to: '/mock', icon: Swords, label: 'Mock Interview' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🚀 CareerAI</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={to === '/'}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            AI Career Intelligence Engine
          </div>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
