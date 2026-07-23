import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabaseClient } from '../supabaseClient';
import { FolderKanban, Users, Settings, LogOut, ExternalLink, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    { label: 'Team Members', path: '/team', icon: Users },
    { label: 'Site Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#0B0E14] text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#12151F] border-r border-slate-800 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-brand-mint flex items-center justify-center text-white font-bold text-lg shadow-lg">
              A
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white leading-none">Agency CMS</h1>
              <span className="text-xs text-slate-400 font-mono">Refine + Supabase</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 bg-[#0B0E14]">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
