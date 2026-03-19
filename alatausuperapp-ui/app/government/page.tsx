"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface Project {
  id: string;
  title: string;
  institution: string;
  project_type: string;
  status: string;
  completion_pct: number;
  end_date?: string;
  apartments?: number;
  image_url?: string;
}

interface Poll {
  id: string;
  is_active: boolean;
  options: { id: string; votes: number }[];
}

const TYPE_LABELS: Record<string, string> = {
  residential: "Residential", commercial: "Commercial", infrastructure: "Construction",
  education: "Education", tech: "Tech & Innovation", tourism: "Tourism", industrial: "Industrial",
};

const TYPE_GRADIENT: Record<string, string> = {
  residential: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
  commercial: "linear-gradient(135deg, #4c1d95, #7c3aed)",
  infrastructure: "linear-gradient(135deg, #1c1917, #78716c)",
  education: "linear-gradient(135deg, #14532d, #16a34a)",
  tech: "linear-gradient(135deg, #164e63, #0891b2)",
  tourism: "linear-gradient(135deg, #134e4a, #0d9488)",
  industrial: "linear-gradient(135deg, #7c2d12, #ea580c)",
};

const TYPE_BADGE_COLOR: Record<string, string> = {
  residential: "rgba(59,130,246,0.85)", commercial: "rgba(124,58,237,0.85)",
  infrastructure: "rgba(245,158,11,0.85)", education: "rgba(22,163,74,0.85)",
  tech: "rgba(8,145,178,0.85)", tourism: "rgba(13,148,136,0.85)", industrial: "rgba(234,88,12,0.85)",
};

function TrendingUpIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
function StarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function EyeIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}
function MapPinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function CalendarIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
function ChevronRightIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>;
}
function TrashIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
}

function ProjectBg({ project, className }: { project: Project; className?: string }) {
  const gradient = TYPE_GRADIENT[project.project_type] ?? "linear-gradient(135deg, #1c1917, #78716c)";
  const [imgFailed, setImgFailed] = useState(false);
  if (project.image_url && !imgFailed) {
    const src = project.image_url.startsWith("http") ? project.image_url : `${API}${project.image_url}`;
    return <img src={src} alt={project.title} className={`object-cover ${className ?? ""}`} onError={() => setImgFailed(true)} />;
  }
  return <div className={className ?? ""} style={{ background: gradient }} />;
}

export default function GovernmentDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([fetch(`${API}/projects`), fetch(`${API}/polls`)]).then(
      ([projRes, pollsRes]) => {
        if (projRes.status === "fulfilled" && projRes.value.ok) projRes.value.json().then(setProjects);
        if (pollsRes.status === "fulfilled" && pollsRes.value.ok) pollsRes.value.json().then(setPolls);
        setLoading(false);
      }
    );
  }, []);

  async function revokeProject(id: string) {
    await fetch(`${API}/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalVotes = polls.reduce((sum, p) => sum + p.options.reduce((s, o) => s + o.votes, 0), 0);
  const sorted = [...projects].sort((a, b) => b.completion_pct - a.completion_pct);
  const featured = sorted[0];
  const rest = sorted.slice(1, 4);

  const stats = [
    { label: "Projects in Alatau", value: projects.length, icon: <TrendingUpIcon />, iconBg: "#eff6ff", iconColor: "#3b82f6" },
    { label: "Active projects", value: activeProjects, icon: <StarIcon />, iconBg: "#fffbeb", iconColor: "#f59e0b" },
    { label: "Total votes", value: totalVotes.toLocaleString(), icon: <EyeIcon />, iconBg: "#f0fdfa", iconColor: "#0d9488" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Loading...</div></div>;
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: stat.iconBg, color: stat.iconColor }}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Featured project */}
      {featured && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Key Project</h2>
            <Link href="/government/projects" className="flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
              View all <ChevronRightIcon />
            </Link>
          </div>
          <div className="relative rounded-2xl overflow-hidden h-72 group">
            <ProjectBg project={featured} className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: TYPE_BADGE_COLOR[featured.project_type] ?? "rgba(107,114,128,0.85)" }}>
                {TYPE_LABELS[featured.project_type] ?? featured.project_type}
              </span>
            </div>
            <button onClick={() => revokeProject(featured.id)} className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/30 hover:bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white/80 hover:text-white transition-all opacity-0 group-hover:opacity-100">
              <TrashIcon /> Revoke
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-xl font-bold text-white mb-2">{featured.title}</h3>
              <div className="flex items-center gap-4 text-white/70 text-sm mb-4">
                <span className="flex items-center gap-1.5"><MapPinIcon /> Alatau, Almaty</span>
                {featured.end_date && <span className="flex items-center gap-1.5"><CalendarIcon /> Deadline: {new Date(featured.end_date).getFullYear()}</span>}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                  <div className="h-full rounded-full bg-blue-400" style={{ width: `${featured.completion_pct}%` }} />
                </div>
                <span className="text-sm font-medium text-white/90 whitespace-nowrap">{featured.completion_pct}% complete</span>
              </div>
            </div>
            {featured.apartments && (
              <div className="absolute bottom-6 right-6">
                <span className="rounded-xl bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-lg">{featured.apartments.toLocaleString()} units</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Grid */}
      {rest.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">You might also like</h2>
            <Link href="/government/projects" className="flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
              View all <ChevronRightIcon />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {rest.map((project) => (
              <div key={project.id} className="rounded-2xl bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className="relative h-40 overflow-hidden">
                  <ProjectBg project={project} className="absolute inset-0 w-full h-full" />
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                      {TYPE_LABELS[project.project_type] ?? project.project_type}
                    </span>
                  </div>
                  <button onClick={() => revokeProject(project.id)} className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/30 hover:bg-red-500/80 px-2.5 py-1 text-xs font-medium text-white transition-all opacity-0 group-hover:opacity-100">
                    <TrashIcon /> Revoke
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3">{project.title}</h3>
                  <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${project.completion_pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-500">{project.completion_pct}% ready</span>
                    {project.end_date && <span className="text-xs text-gray-400">{new Date(project.end_date).getFullYear()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-400 text-sm">No projects yet.</p>
          <Link href="/government/projects" className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">Go to Projects</Link>
        </div>
      )}
    </div>
  );
}
