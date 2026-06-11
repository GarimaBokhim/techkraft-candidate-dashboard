import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/instance";

export type CandidateStatus =
  | "new"
  | "reviewed"
  | "hired"
  | "rejected"
  | "archived";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role_applied: string;
  status: CandidateStatus;
  skills: string[];
  created_at: string;
  internal_notes?: string;
}

export interface Score {
  id: string;
  category: string;
  score: number;
  reviewer_id: string;
  note?: string;
  created_at: string;
}

export interface CandidateDetail extends Candidate {
  scores: Score[];
}

export interface CandidatesResponse {
  total: number;
  offset: number;
  limit: number;
  items: Candidate[];
}
const candidateKeys = {
  all: ["candidates"] as const,
  detail: (id: string) => ["candidate", id] as const,
};

export const useCandidates = (params: {
  status?: string;
  role_applied?: string;
  skill?: string;
  keyword?: string;
  offset: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["candidates", params],
    queryFn: async () => {
      const { data } = await api.get<CandidatesResponse>("/candidates", {
        params,
      });
      return data;
    },
  });
};

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: candidateKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get<CandidateDetail>(`/candidates/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useSubmitScore = (candidateId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scoreData: {
      category: string;
      score: number;
      note?: string;
    }) => {
      const { data } = await api.post(
        `/candidates/${candidateId}/scores`,
        scoreData,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: candidateKeys.detail(candidateId),
      });
    },
  });
};

export const useGenerateSummary = (candidateId: string) => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{
        candidate_id: string;
        summary: string;
      }>(`/candidates/${candidateId}/summary`);
      return data;
    },
  });
};

export const useUpdateInternalNotes = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { internal_notes: string }) => {
      const res = await api.patch(`/candidates/${id}/internal-notes`, {
        internal_notes: data.internal_notes,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: candidateKeys.detail(id),
      });
    },
  });
};
