"use client";

import { useEffect, useState } from "react";
import { useToast } from "../components/Toast";
import { useConfirm } from "../components/ConfirmDialog";
import TrashIcon from "../components/TrashIcon";

const API = process.env.NEXT_PUBLIC_API ?? "/api";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  lat?: number;
  lon?: number;
  is_active: boolean;
  created_at?: string;
  options: PollOption[];
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  async function fetchPolls() {
    try {
      const res = await fetch(`${API}/polls`);
      if (res.ok) setPolls(await res.json());
    } catch {
      // API may be down
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPolls();
  }, []);

  async function handleDelete(id: string, title: string) {
    const confirmed = await confirm({
      title: "Delete Poll",
      message: `Are you sure you want to delete "${title}"? All votes will be lost.`,
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;
    await fetch(`${API}/polls/${id}`, { method: "DELETE" });
    toast(`Poll "${title}" deleted`, "success");
    fetchPolls();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-sm">Loading polls...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Poll Results</h1>
        <p className="text-sm text-gray-400 mt-1">
          Read-only view for city planners &middot; {polls.length} poll
          {polls.length !== 1 ? "s" : ""}
        </p>
      </div>

      {polls.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No polls yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {polls.map((poll) => {
            const totalVotes = poll.options.reduce(
              (sum, o) => sum + o.votes,
              0
            );
            const maxVotes = Math.max(...poll.options.map((o) => o.votes));

            return (
              <div
                key={poll.id}
                className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Poll header */}
                <div className="p-5 pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            poll.is_active
                              ? "bg-blue-50 text-blue-800 border-blue-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {poll.is_active ? "Active" : "Closed"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {totalVotes.toLocaleString()} vote
                          {totalVotes !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {poll.title}
                      </h3>
                      {poll.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {poll.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(poll.id, poll.title)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100 shrink-0"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {/* Options with bar chart */}
                <div className="p-5 flex flex-col gap-2.5">
                  {poll.options.map((option) => {
                    const pct =
                      totalVotes > 0
                        ? Math.round((option.votes / totalVotes) * 100)
                        : 0;
                    const isLeading =
                      option.votes === maxVotes && option.votes > 0;

                    return (
                      <div key={option.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-sm ${
                              isLeading
                                ? "font-semibold text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {option.text}
                          </span>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <span className="text-xs text-gray-400 tabular-nums">
                              {option.votes.toLocaleString()}
                            </span>
                            <span
                              className={`text-xs font-medium tabular-nums w-10 text-right ${
                                isLeading ? "text-brand" : "text-gray-500"
                              }`}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isLeading ? "bg-brand-mid" : "bg-gray-300"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                {(poll.lat != null || poll.created_at) && (
                  <div className="px-5 pb-4 flex items-center gap-3 text-xs text-gray-400">
                    {poll.lat != null && poll.lon != null && (
                      <span className="font-mono">
                        {poll.lat.toFixed(3)}, {poll.lon!.toFixed(3)}
                      </span>
                    )}
                    {poll.created_at && (
                      <span>
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
