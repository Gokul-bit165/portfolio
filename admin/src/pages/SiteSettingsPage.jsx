import React, { useEffect, useState } from 'react';
import { supabaseClient } from '../supabaseClient';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({
    hero_headline: 'We Ship Software, Not Decks',
    hero_subhead: '5 friends, no suits. Five friends coding, building, and launching products under pressure.',
    availability_status: 'Available for Q3/Q4 builds',
    contact_email: 'hello@agency.dev',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient.from('site_settings').select('*');
    if (!error && data) {
      const map = { ...settings };
      data.forEach((item) => {
        map[item.key] = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
      });
      setSettings(map);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
      }));

      const { error } = await supabaseClient.from('site_settings').upsert(updates);
      if (error) throw error;

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error saving site settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Site-wide Settings</h1>
          <p className="text-sm text-slate-400">Configure global hero titles, status pills, and contact details</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>Settings saved successfully! Public portfolio will render updated values.</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-mono">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Availability Status Pill Text
            </label>
            <input
              type="text"
              required
              value={settings.availability_status}
              onChange={(e) => setSettings({ ...settings, availability_status: e.target.value })}
              placeholder="e.g. Available for Q3/Q4 builds"
              className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-brand-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">Appears in navigation header status pills across all pages.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Hero Section Headline
            </label>
            <input
              type="text"
              required
              value={settings.hero_headline}
              onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
              placeholder="We Ship Software, Not Decks"
              className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Hero Section Subhead / Bio Tagline
            </label>
            <textarea
              rows="3"
              required
              value={settings.hero_subhead}
              onChange={(e) => setSettings({ ...settings, hero_subhead: e.target.value })}
              placeholder="5 friends, no suits..."
              className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
              Primary Contact Email
            </label>
            <input
              type="email"
              required
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              placeholder="hello@agency.dev"
              className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </form>
      )}
    </div>
  );
}
