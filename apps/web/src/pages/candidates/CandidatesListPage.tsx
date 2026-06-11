import { useState } from "react";
import { Link } from "react-router-dom";
import { useCandidates, type CandidateStatus } from "../../api/candidates";

export default function CandidatesListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const [status, setStatus] = useState<CandidateStatus | "">("");
  const [roleApplied, setRoleApplied] = useState("");
  const [skill, setSkill] = useState("");
  const [keyword, setKeyword] = useState("");

  const offset = (page - 1) * pageSize;

  const { data, isLoading, isError } = useCandidates({
    status: status || undefined,
    role_applied: roleApplied || undefined,
    skill: skill || undefined,
    keyword: keyword || undefined,
    offset,
    limit: pageSize,
  });

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Candidates
          </h1>
          <p className="text-gray-500 mt-1">
            Review and manage candidate applications.
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <form
          onSubmit={handleFilter}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CandidateStatus)}
              className="w-full cursor-pointer rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend"
              value={roleApplied}
              onChange={(e) => setRoleApplied(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill
            </label>
            <input
              type="text"
              placeholder="e.g. React"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keyword
            </label>
            <input
              type="text"
              placeholder="Name or email"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#19275A] cursor-pointer  hover:bg-[#22387C] text-white py-2 px-4 rounded-xl text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">
            Loading candidates...
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-red-500">
            Error loading candidates.
          </div>
        ) : data?.items.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No candidates found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">
                    Candidate
                  </th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">
                    Role Applied
                  </th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">
                    Status
                  </th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm">
                    Skills
                  </th>
                  <th className="py-4 px-6 font-medium text-gray-500 text-sm text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.items.map((candidate) => (
                  <tr
                    key={candidate.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">
                        {candidate.name}
                      </p>
                      <p className="text-sm text-gray-500">{candidate.email}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {candidate.role_applied}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                        ${candidate.status === "new" ? "bg-blue-100 text-blue-700" : ""}
                        ${candidate.status === "reviewed" ? "bg-purple-100 text-purple-700" : ""}
                        ${candidate.status === "hired" ? "bg-green-100 text-green-700" : ""}
                        ${candidate.status === "rejected" ? "bg-red-100 text-red-700" : ""}
                        ${candidate.status === "archived" ? "bg-gray-100 text-gray-700" : ""}
                      `}
                      >
                        {candidate.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                            +{candidate.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/candidates/${candidate.id}`}
                        className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 0 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing {offset + 1} to {Math.min(offset + pageSize, data.total)}{" "}
              of {data.total} candidates
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded bg-white border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={offset + pageSize >= data.total}
                className="px-3 py-1 rounded bg-white border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
