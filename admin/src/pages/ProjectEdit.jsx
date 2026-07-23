import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient, deleteStorageFileByUrl } from '../supabaseClient';
import { ArrowLeft, Save, Upload, Plus, Trash2, Video, Image, Link2, ExternalLink, ArrowUp, ArrowDown, Edit2, Check, X } from 'lucide-react';

export default function ProjectEdit() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    tagline: '',
    description: '',
    client: '',
    year: '2026',
    category: 'Software Architecture',
    cover_image: '',
    stack_tags_input: 'React, Node.js, Python',
    github_url: '',
    live_url: '',
    is_published: true,
    sort_order: 0,
  });

  const [stats, setStats] = useState([
    { label: 'Latency', value: '<20ms' },
    { label: 'Uptime', value: '99.9%' },
  ]);

  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState('video_embed');
  const [newMediaCaption, setNewMediaCaption] = useState('');

  // Editing existing media item state
  const [editingMediaId, setEditingMediaId] = useState(null);
  const [editMediaForm, setEditMediaForm] = useState({ caption: '', url: '', media_type: 'image' });

  useEffect(() => {
    if (!isNew) {
      fetchProject();
      fetchMedia();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      setForm({
        ...data,
        stack_tags_input: Array.isArray(data.stack_tags) ? data.stack_tags.join(', ') : '',
      });
      if (Array.isArray(data.stats)) {
        setStats(data.stats);
      }
    }
    setLoading(false);
  };

  const fetchMedia = async () => {
    const { data } = await supabaseClient
      .from('project_media')
      .select('*')
      .eq('project_id', id)
      .order('sort_order', { ascending: true });

    if (data) {
      setMediaItems(data);
    }
  };

  // Upload cover image to Supabase storage
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `project-covers/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseClient.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      setForm((prev) => ({ ...prev, cover_image: publicUrlData.publicUrl }));
    } catch (err) {
      alert('Error uploading cover image: ' + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const stack_tags = form.stack_tags_input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title,
      slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: form.tagline,
      description: form.description,
      client: form.client,
      year: form.year,
      category: form.category,
      cover_image: form.cover_image,
      stack_tags,
      stats,
      github_url: form.github_url,
      live_url: form.live_url,
      is_published: form.is_published,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };

    let projId = id;
    if (isNew) {
      const { data, error } = await supabaseClient.from('projects').insert([payload]).select().single();
      if (error) {
        alert('Error saving project: ' + error.message);
        setLoading(false);
        return;
      }
      projId = data.id;
    } else {
      const { error } = await supabaseClient.from('projects').update(payload).eq('id', id);
      if (error) {
        alert('Error updating project: ' + error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    navigate('/projects');
  };

  // Format YouTube URLs
  const formatUrlForEmbed = (url, type) => {
    if (type !== 'video_embed' || !url) return url;
    let str = String(url).trim();
    if (str.includes('youtube.com/watch?v=')) {
      const videoId = str.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (str.includes('youtu.be/')) {
      const videoId = str.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (str.includes('loom.com/share/')) {
      const videoId = str.split('loom.com/share/')[1]?.split('?')[0];
      return `https://www.loom.com/embed/${videoId}`;
    }
    return str;
  };

  // Get preview thumbnail for admin list
  const getMediaPreviewUrl = (media) => {
    if (!media || !media.url) return null;
    if (media.media_type === 'image') return media.url;
    let videoId = '';
    const str = String(media.url).trim();
    if (str.includes('youtube.com/watch?v=')) {
      videoId = str.split('v=')[1]?.split('&')[0];
    } else if (str.includes('youtu.be/')) {
      videoId = str.split('youtu.be/')[1]?.split('?')[0];
    } else if (str.includes('youtube.com/embed/')) {
      videoId = str.split('youtube.com/embed/')[1]?.split('?')[0];
    }
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return null;
  };

  // Add project media
  const addMediaItem = async () => {
    if (!newMediaUrl) return;
    if (isNew) {
      alert('Please save the project first before adding gallery media items.');
      return;
    }

    const finalUrl = formatUrlForEmbed(newMediaUrl, newMediaType);

    const { error } = await supabaseClient.from('project_media').insert([
      {
        project_id: id,
        media_type: newMediaType,
        url: finalUrl,
        caption: newMediaCaption,
        sort_order: mediaItems.length + 1,
      },
    ]);

    if (!error) {
      setNewMediaUrl('');
      setNewMediaCaption('');
      fetchMedia();
    }
  };

  // Upload gallery image file to Supabase storage
  const handleGalleryFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `project-gallery/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('portfolio-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseClient.storage
        .from('portfolio-assets')
        .getPublicUrl(filePath);

      setNewMediaUrl(publicUrlData.publicUrl);
      setNewMediaType('image');
    } catch (err) {
      alert('Error uploading gallery image: ' + err.message);
    }
  };

  // Delete media item with storage cleanup
  const deleteMediaItem = async (media) => {
    if (media.url) {
      await deleteStorageFileByUrl(media.url);
    }
    const { error } = await supabaseClient.from('project_media').delete().eq('id', media.id);
    if (!error) {
      setMediaItems(mediaItems.filter((m) => m.id !== media.id));
    }
  };

  // Re-order media items (Move Up / Down)
  const moveMediaItem = async (index, direction) => {
    const newItems = [...mediaItems];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update sort_order values
    for (let i = 0; i < newItems.length; i++) {
      newItems[i].sort_order = i + 1;
      await supabaseClient
        .from('project_media')
        .update({ sort_order: i + 1 })
        .eq('id', newItems[i].id);
    }

    setMediaItems(newItems);
  };

  // Inline edit media item
  const startEditingMedia = (media) => {
    setEditingMediaId(media.id);
    setEditMediaForm({
      caption: media.caption || '',
      url: media.url || '',
      media_type: media.media_type || 'image',
    });
  };

  const saveEditingMedia = async (mediaId) => {
    const finalUrl = formatUrlForEmbed(editMediaForm.url, editMediaForm.media_type);
    const { error } = await supabaseClient
      .from('project_media')
      .update({
        caption: editMediaForm.caption,
        url: finalUrl,
        media_type: editMediaForm.media_type,
      })
      .eq('id', mediaId);

    if (!error) {
      setEditingMediaId(null);
      fetchMedia();
    } else {
      alert('Error updating media item: ' + error.message);
    }
  };

  return (
    <div className="pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : isNew ? 'Create Case Study' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Project Metadata</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. AeroTwin State Sync"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. aerotwin"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tagline / Short Summary</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. Sub-50ms autonomous state synchronization engine"
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Case Study Overview</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Explain the problem, architecture, engineering hurdles, and solution..."
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Client / Agency</label>
                <input
                  type="text"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="e.g. SkyBound Aero"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Year</label>
                <input
                  type="text"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="2026"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. AI & Robotics"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Stack Tags (comma-separated)</label>
              <input
                type="text"
                value={form.stack_tags_input}
                onChange={(e) => setForm({ ...form, stack_tags_input: e.target.value })}
                placeholder="Rust, WebGPU, Python, ROS2"
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">GitHub Repository Link</label>
                <input
                  type="text"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  placeholder="https://github.com/org/repo"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Live Demo / Deployment Link</label>
                <input
                  type="text"
                  value={form.live_url}
                  onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                  placeholder="https://app.agency.dev"
                  className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Key Stats Table */}
          <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Project Performance Stats</h2>
              <button
                type="button"
                onClick={() => setStats([...stats, { label: '', value: '' }])}
                className="text-xs text-brand-mint font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Metric Row
              </button>
            </div>

            <div className="space-y-2">
              {stats.map((st, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={st.label}
                    onChange={(e) => {
                      const updated = [...stats];
                      updated[idx].label = e.target.value;
                      setStats(updated);
                    }}
                    placeholder="Label (e.g. Latency)"
                    className="flex-1 bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={st.value}
                    onChange={(e) => {
                      const updated = [...stats];
                      updated[idx].value = e.target.value;
                      setStats(updated);
                    }}
                    placeholder="Value (e.g. <20ms)"
                    className="flex-1 bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-brand-mint font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setStats(stats.filter((_, i) => i !== idx))}
                    className="text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Media Items */}
          {!isNew && (
            <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Gallery Showcase & Embeds</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Item #1 is displayed FIRST as the main video/photo hero stage.</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full">
                  {mediaItems.length} items
                </span>
              </div>

              {/* Existing Gallery Media List */}
              <div className="space-y-3">
                {mediaItems.map((item, idx) => {
                  const previewThumb = getMediaPreviewUrl(item);
                  const isEditing = editingMediaId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-[#0B0E14] border border-slate-800 rounded-xl space-y-2"
                    >
                      {isEditing ? (
                        /* Inline Edit Form */
                        <div className="space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <select
                              value={editMediaForm.media_type}
                              onChange={(e) => setEditMediaForm({ ...editMediaForm, media_type: e.target.value })}
                              className="bg-[#12151F] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            >
                              <option value="video_embed">Video Embed</option>
                              <option value="image">Image</option>
                              <option value="video">Direct Video</option>
                            </select>
                            <input
                              type="text"
                              value={editMediaForm.caption}
                              onChange={(e) => setEditMediaForm({ ...editMediaForm, caption: e.target.value })}
                              placeholder="Caption"
                              className="sm:col-span-2 bg-[#12151F] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <input
                            type="text"
                            value={editMediaForm.url}
                            onChange={(e) => setEditMediaForm({ ...editMediaForm, url: e.target.value })}
                            placeholder="Media URL"
                            className="w-full bg-[#12151F] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                          />
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => setEditingMediaId(null)}
                              className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                            <button
                              onClick={() => saveEditingMedia(item.id)}
                              className="px-3 py-1 bg-brand-500 text-white rounded-lg text-xs flex items-center gap-1 font-semibold"
                            >
                              <Check className="w-3.5 h-3.5" /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Normal View Item Card */
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 overflow-hidden flex-1">
                            {/* Order Number Badge */}
                            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center font-bold flex-shrink-0">
                              #{idx + 1}
                            </span>

                            {/* Preview Thumbnail */}
                            <div className="w-12 h-10 bg-slate-900 rounded border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {previewThumb ? (
                                <img src={previewThumb} alt="preview" className="w-full h-full object-cover" />
                              ) : item.media_type === 'video_embed' ? (
                                <Video className="w-5 h-5 text-brand-accent" />
                              ) : (
                                <Image className="w-5 h-5 text-brand-mint" />
                              )}
                            </div>

                            <div className="overflow-hidden flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  {item.caption || 'Untitled Media'}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">
                                  {item.media_type}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono block truncate">
                                {item.url}
                              </span>
                            </div>
                          </div>

                          {/* Controls (Up, Down, Edit, Delete) */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => moveMediaItem(idx, -1)}
                              disabled={idx === 0}
                              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                              title="Move Up (Make Display First)"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveMediaItem(idx, 1)}
                              disabled={idx === mediaItems.length - 1}
                              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => startEditingMedia(item)}
                              className="p-1.5 text-brand-mint hover:bg-brand-mint/10 rounded"
                              title="Edit Caption / URL"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteMediaItem(item)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add New Media Control */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase text-slate-400">Add New Gallery Item</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newMediaType}
                    onChange={(e) => setNewMediaType(e.target.value)}
                    className="bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="video_embed">Video Embed (YouTube/Loom URL)</option>
                    <option value="image">Image URL / Upload</option>
                    <option value="video">Direct Video URL</option>
                  </select>

                  <input
                    type="text"
                    value={newMediaCaption}
                    onChange={(e) => setNewMediaCaption(e.target.value)}
                    placeholder="Caption (e.g. Telemetry HUD)"
                    className="bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />

                  <div className="flex items-center gap-2">
                    <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl cursor-pointer flex items-center gap-1.5 w-full justify-center">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Image</span>
                      <input type="file" onChange={handleGalleryFileUpload} className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder="Media URL or https://www.youtube.com/watch?v=..."
                    className="flex-1 bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={addMediaItem}
                    className="px-4 py-2 bg-brand-mint text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-brand-mint/90"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Status & Media Cover */}
        <div className="space-y-6">
          <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Publishing Status</h2>

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
              <label className="block text-xs font-medium text-slate-300 mb-1">Display Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="bg-[#12151F] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Primary Cover Image</h2>

            {form.cover_image ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                <img
                  src={form.cover_image}
                  alt="Cover"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                  }}
                />
              </div>
            ) : (
              <div className="aspect-video rounded-xl border-2 border-dashed border-slate-800 bg-[#0B0E14] flex flex-col items-center justify-center text-slate-500 text-xs">
                <Image className="w-8 h-8 mb-2 opacity-50" />
                <span>No cover image uploaded</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center justify-center gap-2 transition-colors">
                <Upload className="w-4 h-4" />
                <span>{uploadingCover ? 'Uploading...' : 'Upload New Cover Image'}</span>
                <input
                  type="file"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="hidden"
                  accept="image/*"
                />
              </label>

              <input
                type="text"
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                placeholder="Or paste image URL directly..."
                className="w-full bg-[#0B0E14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
