import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import {
  useCandidate,
  useSubmitScore,
  useGenerateSummary,
} from "../../api/candidates";
import { useAuth } from "../../lib/auth-context";
import { toast } from "sonner";
import CandidateInternalNote from "./CandidateInternalNote";

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();

  const { data: candidate, isLoading, isError } = useCandidate(id!);
  const submitScore = useSubmitScore(id!);
  const generateSummary = useGenerateSummary(id!);

  const [category, setCategory] = useState("Technical");
  const [score, setScore] = useState("3");
  const [note, setNote] = useState("");
  const [summary, setSummary] = useState<string | null>(null);

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-500">Loading candidate...</div>
    );

  if (isError || !candidate)
    return (
      <div className="p-10 text-center text-red-500">
        Error loading candidate.
      </div>
    );

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitScore.mutate(
      { category, score: parseInt(score, 10), note },
      {
        onSuccess: () => {
          toast.success("Score submitted successfully");
          setNote("");
        },
        onError: () => {
          toast.error("Failed to submit score");
        },
      },
    );
  };

  const handleGenerateSummary = () => {
    generateSummary.mutate(undefined, {
      onSuccess: (data) => {
        setSummary(data.summary);
        toast.success("Summary generated!");
      },
      onError: () => {
        toast.error("Failed to generate summary");
      },
    });
  };

  const visibleScores = candidate.scores;

  return (
    <div className="overflow-hidden flex flex-col">
      <div className=" px-4 border-b bg-white">
        <div className="flex items-center gap-4">
          <Link
            to="/candidates"
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-bold text-gray-600">Candidate Profile</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 max-w-5xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {candidate.name}
                    </h2>
                    <p className="text-gray-500">{candidate.email}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wider
                      ${
                        candidate.status === "new"
                          ? "bg-blue-100 text-blue-700"
                          : ""
                      }
                      ${
                        candidate.status === "reviewed"
                          ? "bg-purple-100 text-purple-700"
                          : ""
                      }
                      ${
                        candidate.status === "hired"
                          ? "bg-green-100 text-green-700"
                          : ""
                      }
                      ${
                        candidate.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : ""
                      }
                      ${
                        candidate.status === "archived"
                          ? "bg-gray-100 text-gray-700"
                          : ""
                      }`}
                  >
                    {candidate.status}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Role Applied</p>
                    <p className="font-medium">{candidate.role_applied}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Summary
                  </h3>

                  <button
                    onClick={handleGenerateSummary}
                    disabled={generateSummary.isPending}
                    className="bg-[#19275A] cursor-pointer hover:bg-[#22387C] text-white py-1.5 px-4 rounded-xl text-sm"
                  >
                    {generateSummary.isPending
                      ? "Generating..."
                      : "Generate Summary"}
                  </button>
                </div>

                {generateSummary.isPending ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                ) : summary ? (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-900">
                    {summary}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No summary generated yet.
                  </p>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Scores ({visibleScores.length})
                </h3>

                {visibleScores.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No scores submitted yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {visibleScores.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 bg-gray-50 rounded-xl border"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">{s.category}</span>
                          <span className="bg-[#19275A] text-white px-2 rounded-full text-sm flex items-center">
                            {s.score}/5
                          </span>
                        </div>

                        {s.note && (
                          <p className="text-sm mt-2 text-gray-600">{s.note}</p>
                        )}

                        <div className="text-xs text-gray-400 mt-2 flex justify-between">
                          <span>Reviewer: {s.reviewer_id}</span>
                          <span>
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6 lg:sticky lg:top-6 pr-2">
              <div className="bg-white p-6 rounded-2xl shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Submit Score</h3>

                <form onSubmit={handleScoreSubmit} className="space-y-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border cursor-pointer rounded-xl bg-gray-50"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Communication">Communication</option>
                    <option value="Cultural Fit">Cultural Fit</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Problem Solving">Problem Solving</option>
                  </select>

                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setScore(num.toString())}
                        className={`flex-1 py-2 rounded-xl border cursor-pointer ${
                          score === num.toString()
                            ? "bg-[#19275A] text-white"
                            : "bg-gray-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 border rounded-xl bg-gray-50"
                    rows={3}
                    placeholder="Add note..."
                  />

                  <button
                    type="submit"
                    disabled={submitScore.isPending}
                    className="w-full bg-[#19275A] text-white py-2 rounded-xl cursor-pointer"
                  >
                    {submitScore.isPending ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
              {role === "admin" && candidate && (
                <CandidateInternalNote candidate={candidate} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
