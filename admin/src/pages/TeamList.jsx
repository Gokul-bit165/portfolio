import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseClient, deleteStorageFileByUrl } from '../supabaseClient';
import { Plus, Eye, EyeOff, Trash2, Edit2, ArrowUp, ArrowDown } from 'lucide-react';

export default function TeamList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('team_members')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const togglePublish = async (member) => {
    const nextStatus = !member.is_published;
    const { error } = await supabaseClient
      .from('team_members')
      .update({ is_published: nextStatus })
      .eq('id', member.id);

    if (!error) {
      setMembers(members.map(m => m.id === member.id ? { ...m, is_published: nextStatus } : m));
    }
  };

  const deleteMember = async (member) => {
    if (!window.confirm(`Delete team member "${member.name}"?`)) return;

    if (member.avatar_url) {
      await deleteStorageFileByUrl(member.avatar_url);
    }

    const { error } = await supabaseClient.from('team_members').delete().eq('id', member.id);
    if (!error) {
      setMembers(members.filter(m => m.id !== member.id));
    }
  };

  const moveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= members.length) return;

    const newMembers = [...members];
    const current = newMembers[index];
    const target = newMembers[targetIdx];

    const tempOrder = current.sort_order;
    current.sort_order = target.sort_order || targetIdx;
    target.sort_order = tempOrder || index;

    newMembers[index] = target;
    newMembers[targetIdx] = current;
    setMembers(newMembers);

    await supabaseClient.from('team_members').upsert([
      { id: current.id, sort_order: current.sort_order },
      { id: target.id, sort_order: target.sort_order }
    ]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Team Builders</h1>
          <p className="text-sm text-slate-400">Manage builder profiles, avatars, workstation roles, and git logs</p>
        </div>
        <Link
          to="/team/new"
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Builder</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 font-mono">Loading team...</div>
      ) : members.length === 0 ? (
        <div className="p-12 text-center bg-[#12151F] border border-slate-800 rounded-2xl">
          <p className="text-slate-400 mb-4">No team members added yet.</p>
          <Link to="/team/new" className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg">
            Add Member
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m, index) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-4 bg-[#12151F] border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1 text-slate-500">
                  <button
                    disabled={index === 0}
                    onClick={() => moveOrder(index, -1)}
                    className="hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === members.length - 1}
                    onClick={() => moveOrder(index, 1)}
                    className="hover:text-white disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-xl bg-brand-mint/20 border border-brand-mint/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url.startsWith('http') || m.avatar_url.startsWith('/') ? m.avatar_url : `/${m.avatar_url}`}
                      alt={m.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'assets/robot_skectch/robot_smileandtypeonlaptop.png';
                      }}
                    />
                  ) : (
                    <span className="font-bold text-brand-mint">{m.name[0]}</span>
                  )}
                </div>


                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base">{m.name}</h3>
                    <span className="text-xs font-mono text-brand-accent">{m.role}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{m.bio || 'No bio'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePublish(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    m.is_published
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {m.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{m.is_published ? 'Visible' : 'Hidden'}</span>
                </button>

                <Link
                  to={`/team/edit/${m.id}`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => deleteMember(m)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
