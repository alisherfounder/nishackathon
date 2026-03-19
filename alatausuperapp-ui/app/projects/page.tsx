"use client";

import { useEffect, useState } from "react";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/ConfirmDialog";
import TrashIcon from "../components/TrashIcon";

const API = "http://localhost:8000";

interface Project {
  id: string;
  title: string;
  description?: string;
  institution: string;
  status: string;
  lat?: number;
  lon?: number;
  created_at?: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-50 text-blue-800 border-blue-200",
  planned: "bg-brand-light/20 text-brand border-brand-light",
  completed: "bg-gray-100 text-gray-600 border-gray-200",
};

const INPUT_CLS =
  "px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-light/40 focus:border-brand-mid";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    institution: "",
    description: "",
    status: "active",
    lat: "",
    lon: "",
  });
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        institution: form.institution,
        description: form.description || undefined,
        status: form.status,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lon: form.lon ? parseFloat(form.lon) : undefined,
      };
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ title: "", institution: "", description: "", status: "active", lat: "", lon: "" });
        toast(`Project "${form.title}" created`, "success");
        fetchProjects();
      }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-400 mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors"
          style={{ background: showForm ? "#6A94F5" : "linear-gradient(135deg, #0F4C75 0%, #6A94F5 100%)" }}
        >
          {showForm ? "Cancel" : "+ New Project"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white border border-gray-200 p-6 mb-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Create Project</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input required placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} className={INPUT_CLS} />
            <input required placeholder="Institution" value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })} className={INPUT_CLS} />
            <input placeholder="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} className={INPUT_CLS} />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={INPUT_CLS}>
              <option value="active">Active</option>
              <option value="planned">Planned</option>
              <option value="completed">Completed</option>
            </select>
            <input placeholder="Latitude" value={form.lat}
              onChange={(e) => setForm({ ...form, lat: e.target.value })} className={INPUT_CLS} />
            <input placeholder="Longitude" value={form.lon}
              onChange={(e) => setForm({ ...form, lon: e.target.value })} className={INPUT_CLS} />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0F4C75 0%, #6A94F5 100%)" }}
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No projects found. Create one to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Institution</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinates</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{project.title}</p>
                    {project.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{project.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{project.institution}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[project.status] ?? STATUS_COLORS.completed}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">
                    {project.lat != null && project.lon != null
                      ? `${project.lat.toFixed(4)}, ${project.lon.toFixed(4)}`
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
