"use client";

import { useEffect, useState, useRef } from "react";
import { useToast } from "../../components/Toast";
import { useConfirm } from "../../components/ConfirmDialog";
import TrashIcon from "../../components/TrashIcon";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface Project {
  id: string;
  title: string;
  description?: string;
  institution: string;
  project_type: string;
  status: string;
  completion_pct: number;
  start_date?: string;
  end_date?: string;
  apartments?: number;
  image_url?: string;
  lat?: number;
  lon?: number;
  created_at?: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; text: string }> = {
  residential:    { label: "Residential",    color: "bg-blue-500",    text: "text-blue-700" },
  commercial:     { label: "Commercial",     color: "bg-purple-500",  text: "text-purple-700" },
  infrastructure: { label: "Infrastructure", color: "bg-amber-500",   text: "text-amber-700" },
  education:      { label: "Education",      color: "bg-green-500",   text: "text-green-700" },
  tech:           { label: "Tech & Innovation", color: "bg-cyan-500", text: "text-cyan-700" },
  tourism:        { label: "Tourism",        color: "bg-teal-500",    text: "text-teal-700" },
  industrial:     { label: "Industrial",     color: "bg-orange-500",  text: "text-orange-700" },
};

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-emerald-100 text-emerald-700",
  planned:   "bg-blue-100 text-blue-700",
  completed: "bg-gray-100 text-gray-600",
};

const GRADIENT_BG: Record<string, string> = {
  residential:    "from-blue-800 to-blue-500",
  commercial:     "from-purple-900 to-purple-600",
  infrastructure: "from-amber-900 to-amber-600",
  education:      "from-green-900 to-green-600",
  tech:           "from-cyan-900 to-cyan-600",
  tourism:        "from-teal-900 to-teal-600",
  industrial:     "from-orange-900 to-orange-600",
};

const INPUT_CLS = "px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light/40 focus:border-brand-mid w-full";

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.infrastructure;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${cfg.color} shadow`}>
      {cfg.label}
    </span>
  );
}

function ProgressBar({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 bg-white/20 rounded-full overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: "linear-gradient(90deg, #A0C4FF, #6A94F5)" }}
      />
    </div>
  );
}

function FeaturedCard({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const gradient = GRADIENT_BG[project.project_type] ?? GRADIENT_BG.infrastructure;
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" style={{ height: 380 }}>
      {/* Background image or gradient */}
      {project.image_url ? (
        <img
          src={project.image_url}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      {/* Top badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <TypeBadge type={project.project_type} />
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[project.status] ?? STATUS_COLORS.planned}`}>
          {project.status}
        </span>
      </div>

      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-4 right-4 text-white/60 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-black/30"
        title="Delete"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-2xl font-bold text-white mb-2 leading-tight">{project.title}</h2>
        <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
          {project.institution && (
            <span className="flex items-center gap-1">
              <span>🏛</span> {project.institution}
            </span>
          )}
          {project.end_date && (
            <span className="flex items-center gap-1">
              <span>📅</span> Due: {project.end_date}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ProgressBar pct={project.completion_pct} className="flex-1" />
          <span className="text-white text-sm font-semibold whitespace-nowrap">
            {project.completion_pct}% complete
          </span>
          {project.apartments != null && (
            <span
              className="shrink-0 px-4 py-1.5 rounded-full text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #0F4C75, #6A94F5)" }}
            >
              {project.apartments.toLocaleString()} apts
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onDelete }: { project: Project; onDelete: () => void }) {
  const gradient = GRADIENT_BG[project.project_type] ?? GRADIENT_BG.infrastructure;
  return (
    <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-3 left-3">
          <TypeBadge type={project.project_type} />
        </div>
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 text-white/70 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-black/30 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{project.title}</h3>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[project.status] ?? STATUS_COLORS.planned}`}>
            {project.status}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3 truncate">{project.institution}</p>

        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Completion</span>
            <span className="font-semibold text-brand-mid">{project.completion_pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${project.completion_pct}%`, background: "linear-gradient(90deg, #A0C4FF, #6A94F5)" }}
            />
          </div>
        </div>

        {/* Footer meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
          {project.end_date ? (
            <span>Due {project.end_date}</span>
          ) : (
            <span>No deadline</span>
          )}
          {project.apartments != null && (
            <span className="font-medium text-brand">{project.apartments.toLocaleString()} apts</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", institution: "", description: "", project_type: "infrastructure",
    status: "active", completion_pct: "0", start_date: "", end_date: "",
    apartments: "", lat: "", lon: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function fetchProjects() {
    try {
      const res = await fetch(`${API}/projects`);
      if (res.ok) setProjects(await res.json());
    } catch {
      // API may be down
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProjects(); }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        institution: form.institution,
        description: form.description || undefined,
        project_type: form.project_type,
        status: form.status,
        completion_pct: parseInt(form.completion_pct) || 0,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        apartments: form.apartments ? parseInt(form.apartments) : undefined,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lon: form.lon ? parseFloat(form.lon) : undefined,
      };
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      const created: Project = await res.json();

      // Upload image if selected
      if (imageFile) {
        const fd = new FormData();
        fd.append("file", imageFile);
        await fetch(`${API}/projects/${created.id}/image`, { method: "POST", body: fd });
      }

      setShowForm(false);
      setForm({ title: "", institution: "", description: "", project_type: "infrastructure", status: "active", completion_pct: "0", start_date: "", end_date: "", apartments: "", lat: "", lon: "" });
      setImageFile(null);
      setImagePreview(null);
      toast(`Project "${form.title}" created`, "success");
      fetchProjects();
    } catch {
      toast("Failed to create project", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    const confirmed = await confirm({
      title: "Delete Project",
      message: `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    await fetch(`${API}/projects/${id}`, { method: "DELETE" });
    toast(`Project "${title}" deleted`, "success");
    fetchProjects();
  }

  // Stats
  const totalApartments = projects.reduce((s, p) => s + (p.apartments ?? 0), 0);
  const activeCount = projects.filter((p) => p.status === "active").length;
  // Featured: highest completion among active projects, or just the first
  const activeProjects = projects.filter((p) => p.status === "active");
  const featured = activeProjects.sort((a, b) => b.completion_pct - a.completion_pct)[0] ?? projects[0];
  const rest = projects.filter((p) => p.id !== featured?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">Alatau City, Kazakhstan</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
          style={{ background: showForm ? "#6A94F5" : "linear-gradient(135deg, #0F4C75 0%, #6A94F5 100%)" }}
        >
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: "📈", value: projects.length, label: "Projects in Alatau" },
          { icon: "⭐", value: activeCount, label: "Active projects" },
          { icon: "🏠", value: totalApartments > 0 ? totalApartments.toLocaleString() : "—", label: "Total apartments" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 px-6 py-5 shadow-sm">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: "#EFF6FF" }}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">New Project</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="text-xs text-gray-500 font-medium block mb-1">Title *</label>
              <input required placeholder="Project title" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Institution *</label>
              <input required placeholder="e.g. Alatau City Development" value={form.institution}
                onChange={(e) => setForm({ ...form, institution: e.target.value })} className={INPUT_CLS} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs text-gray-500 font-medium block mb-1">Description</label>
              <textarea placeholder="Project description..." value={form.description} rows={2}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={INPUT_CLS + " resize-none"} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Type</label>
              <select value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} className={INPUT_CLS}>
                {Object.entries(TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={INPUT_CLS}>
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Completion %</label>
              <input type="number" min="0" max="100" placeholder="0" value={form.completion_pct}
                onChange={(e) => setForm({ ...form, completion_pct: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Start Date</label>
              <input type="date" value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">End Date</label>
              <input type="date" value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Apartments (optional)</label>
              <input type="number" min="0" placeholder="e.g. 420" value={form.apartments}
                onChange={(e) => setForm({ ...form, apartments: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Latitude</label>
              <input placeholder="43.6743" value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })} className={INPUT_CLS} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Longitude</label>
              <input placeholder="77.1082" value={form.lon}
                onChange={(e) => setForm({ ...form, lon: e.target.value })} className={INPUT_CLS} />
            </div>
            {/* Image upload */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs text-gray-500 font-medium block mb-1">Project Image</label>
              <div
                onClick={() => fileRef.current?.click()}
                className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-mid transition-colors overflow-hidden"
                style={{ height: imagePreview ? 160 : 80 }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full gap-2 text-gray-400">
                    <span className="text-xl">📷</span>
                    <span className="text-sm">Click to upload image</span>
                  </div>
                )}
                {imagePreview && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">Change image</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
          <button
            type="submit" disabled={submitting}
            className="mt-5 px-5 py-2.5 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0F4C75 0%, #6A94F5 100%)" }}
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <>
          {/* Featured card */}
          {featured && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Key Project</h2>
                <button className="text-sm font-medium text-brand-mid hover:text-brand transition-colors">
                  View all →
                </button>
              </div>
              <FeaturedCard
                project={featured}
                onDelete={() => handleDelete(featured.id, featured.title)}
              />
            </div>
          )}

          {/* Grid */}
          {rest.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">All Projects</h2>
                <span className="text-sm text-gray-400">{rest.length} more</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onDelete={() => handleDelete(p.id, p.title)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
