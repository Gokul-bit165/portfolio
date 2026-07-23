import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabaseClient, deleteStorageFileByUrl } from '../supabaseClient';
import { Plus, GripVertical, Eye, EyeOff, Trash2, Edit2, ArrowUp, ArrowDown } from 'lucide-react';

export default function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  // Toggle publish / unpublish status
  const togglePublish = async (project) => {
    const nextStatus = !project.is_published;
    const { error } = await supabaseClient
      .from('projects')
      .update({ is_published: nextStatus })
      .eq('id', project.id);

    if (!error) {
      setProjects(projects.map(p => p.id === project.id ? { ...p, is_published: nextStatus } : p));
    }
  };

  // Delete project and cleanup associated storage files
  const deleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
      return;
    }

    // 1. Delete cover image from storage
    if (project.cover_image) {
      await deleteStorageFileByUrl(project.cover_image);
    }

    // 2. Fetch associated project_media and delete their storage files
    const { data: mediaItems } = await supabaseClient
      .from('project_media')
      .select('url')
      .eq('project_id', project.id);

    if (mediaItems) {
      for (const item of mediaItems) {
        await deleteStorageFileByUrl(item.url);
      }
    }

    // 3. Delete database record
    const { error } = await supabaseClient
      .from('projects')
      .delete()
      .eq('id', project.id);

    if (!error) {
      setProjects(projects.filter(p => p.id !== project.id));
    }
  };

  // Move up or down to adjust sort_order
  const moveOrder = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const newProjects = [...projects];
    const current = newProjects[index];
    const target = newProjects[targetIdx];

    // Swap sort orders
    const tempOrder = current.sort_order;
    current.sort_order = target.sort_order || targetIdx;
    target.sort_order = tempOrder || index;

    newProjects[index] = target;
    newProjects[targetIdx] = current;
    setProjects(newProjects);

    // Persist to database
    await supabaseClient.from('projects').upsert([
      { id: current.id, sort_order: current.sort_order },
      { id: target.id, sort_order: target.sort_order }
    ]);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects Directory</h1>
          <p className="text-sm text-slate-400">Manage case studies, stack tags, metrics, and gallery items</p>
        </div>
        <Link
          to="/projects/new"
          className="px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 font-mono">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-[#12151F] border border-slate-800 rounded-2xl">
          <p className="text-slate-400 mb-4">No projects found. Create your first case study!</p>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" /> Add Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 bg-[#12151F] border border-slate-800 rounded-xl hover:border-slate-700 transition-colors"
            >
              {/* Left Info */}
              <div className="flex items-center gap-4">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-1 text-slate-500">
                  <button
                    disabled={index === 0}
                    onClick={() => moveOrder(index, -1)}
                    className="hover:text-white disabled:opacity-20 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === projects.length - 1}
                    onClick={() => moveOrder(index, 1)}
                    className="hover:text-white disabled:opacity-20 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cover Image Thumbnail */}
                <div className="w-16 h-12 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800 flex items-center justify-center">
                  {project.cover_image ? (
                    <img
                      src={project.cover_image.startsWith('http') || project.cover_image.startsWith('/') ? project.cover_image : `/${project.cover_image}`}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600 font-mono">No Image</div>
                  )}
                </div>


                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base">{project.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {project.category || 'General'}
                    </span>
                    {!project.is_published && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Draft / Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-md">
                    {project.tagline || project.description || 'No description'}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2">
                {/* Publish Toggle Button */}
                <button
                  onClick={() => togglePublish(project)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    project.is_published
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title={project.is_published ? 'Published (Click to Unpublish)' : 'Unpublished (Click to Publish)'}
                >
                  {project.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{project.is_published ? 'Published' : 'Hidden'}</span>
                </button>

                {/* Edit Button */}
                <Link
                  to={`/projects/edit/${project.id}`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="Edit Project"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => deleteProject(project)}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                  title="Delete Project & Files"
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
