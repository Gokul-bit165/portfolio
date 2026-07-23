import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient, deleteStorageFileByUrl } from '../supabaseClient';
import { ArrowLeft, Save, Upload, Plus, Trash2 } from 'lucide-react';

export default function TeamEdit() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    role: '',
    specialty: '',
    bio: '',
    avatar_url: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    is_published: true,
    sort_order: 0,
  });

  const [recentCommits, setRecentCommits] = useState([
    { hash: 'a3f21c8', msg: 'feat: CRDT consensus engine' },
    { hash: 'b7d90e3', msg: 'fix: UAV sync race condition' },
  ]);

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('team_members')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setForm(data);
      if (Array.isArray(data.recent_commits)) {
        setRecentCommits(data.recent_commits);
      }
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `team-avatars/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseClient.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      setForm(prev => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
    } catch (err) {
      alert('Error uploading avatar: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      recent_commits: recentCommits,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };

    if (isNew) {
      const { error } = await supabaseClient.from('team_members').insert([payload]);
      if (error) {
        alert('Error adding member: ' + error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabaseClient.from('team_members').update(payload).eq('id', id);
      if (error) {
        alert('Error updating member: ' + error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate('/team');
  };

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/team')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Team
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : isNew ? 'Add Builder' : 'Save Member'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Member Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Gokul"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Dev Lead"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Specialty Focus</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                placeholder="Compilers & Systems"
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bio</label>
              <textarea
                rows="3"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Systems architecture enthusiast..."
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Twitter / X URL</label>
                <input
                  type="text"
                  value={form.twitter_url}
                  onChange={(e) => setForm({ ...form, twitter_url: e.target.value })}
                  placeholder="https://twitter.com/..."
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Git Log Console Commits */}
          <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Console Workstation Git Log</h2>
              <button
                type="button"
                onClick={() => setRecentCommits([...recentCommits, { hash: 'c1e44f7', msg: 'perf: optimization' }])}
                className="text-xs text-brand-mint flex items-center gap-1 font-mono hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Commit Log
              </button>
            </div>

            {recentCommits.map((c, idx) => (
              <div key={idx} className="flex items-center gap-3 font-mono">
                <input
                  type="text"
                  value={c.hash}
                  onChange={(e) => {
                    const newC = [...recentCommits];
                    newC[idx].hash = e.target.value;
                    setRecentCommits(newC);
                  }}
                  placeholder="hash (e.g. a3f21c8)"
                  className="w-28 bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-brand-mint"
                />
                <input
                  type="text"
                  value={c.msg}
                  onChange={(e) => {
                    const newC = [...recentCommits];
                    newC[idx].msg = e.target.value;
                    setRecentCommits(newC);
                  }}
                  placeholder="Commit message..."
                  className="flex-1 bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setRecentCommits(recentCommits.filter((_, i) => i !== idx))}
                  className="text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Avatar & Options */}
        <div className="space-y-6">
          <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Avatar & Status</h2>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Visible on Public Site</span>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Avatar Graphic</label>
              {form.avatar_url ? (
                <div className="relative w-32 h-32 mx-auto bg-brand-mint/20 rounded-2xl overflow-hidden border border-brand-mint/40 flex items-center justify-center p-2">
                  <img
                    src={form.avatar_url.startsWith('http') || form.avatar_url.startsWith('/') ? form.avatar_url : `/${form.avatar_url}`}
                    alt="Avatar"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/robot_skectch/robot_smileandtypeonlaptop.png';
                    }}
                  />
                  <button

                    type="button"
                    onClick={async () => {
                      await deleteStorageFileByUrl(form.avatar_url);
                      setForm({ ...form, avatar_url: '' });
                    }}
                    className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-300">{uploadingAvatar ? 'Uploading...' : 'Upload Image'}</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
