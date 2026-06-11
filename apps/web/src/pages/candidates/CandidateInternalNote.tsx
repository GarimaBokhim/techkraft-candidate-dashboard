import { useState } from "react";
import { useUpdateInternalNotes, type Candidate } from "../../api/candidates";
import { toast } from "sonner";

export default function CandidateInternalNote({
  candidate,
}: {
  candidate: Candidate;
}) {
  const [internalNote, setInternalNote] = useState(
    candidate.internal_notes ?? "",
  );
  const updateNotes = useUpdateInternalNotes(candidate.id);

  const handleSaveNotes = () => {
    updateNotes.mutate(
      { internal_notes: internalNote },
      {
        onSuccess: () => toast.success("Internal notes updated"),
        onError: () => toast.error("Failed to update notes"),
      },
    );
  };

  return (
    <div className="bg-yellow-50 p-6 rounded-2xl border">
      <h3 className="font-semibold text-yellow-900 mb-2">Internal Notes</h3>
      <textarea
        value={internalNote}
        onChange={(e) => setInternalNote(e.target.value)}
        rows={4}
        className="w-full p-2 border rounded-xl bg-white"
      />
      <button
        onClick={handleSaveNotes}
        disabled={updateNotes.isPending}
        className="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-xl cursor-pointer"
      >
        {updateNotes.isPending ? "Saving..." : "Save Notes"}
      </button>
    </div>
  );
}
