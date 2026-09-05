"use client";

import { useQuery } from "@tanstack/react-query";
import {
  browseAllMyDriverLeads,
  browseMyDriverLeads,
  searchMyDriverLeads,
  type DriverLeadSearchParams,
  type DriverLeadsBrowseParams,
} from "@/lib/api/driver-leads";
import { queryKeys } from "@/lib/query-keys";

export function useMyDriverLeadSearch(
  params: DriverLeadSearchParams | null,
  enabled: boolean,
) {
  const company = params?.company ?? "JM";
  const hasField = Boolean(
    params?.name?.trim() || params?.phone?.trim() || params?.email?.trim(),
  );

  return useQuery({
    queryKey: queryKeys.driverLeadsSearch(company, params),
    queryFn: () => searchMyDriverLeads(params!),
    enabled: enabled && Boolean(params) && hasField,
    staleTime: 0,
    retry: 1,
  });
}

export function useMyDriverLeadsBrowse(params: DriverLeadsBrowseParams) {
  const company = params.company ?? "JM";

  return useQuery({
    queryKey: queryKeys.driverLeadsBrowse({
      company,
      status: params.status,
      board: params.board,
      page: params.page,
      per_page: params.per_page,
    }),
    queryFn: () => browseMyDriverLeads(params),
  });
}

export function useMyDriverLeadsBoard(params: {
  company?: string;
  board: string;
  enabled?: boolean;
}) {
  const company = params.company ?? "JM";
  const board = params.board.trim();

  return useQuery({
    queryKey: queryKeys.driverLeadsBrowse({
      company,
      board,
      page: 0,
      per_page: 0,
    }),
    queryFn: () =>
      browseAllMyDriverLeads({
        company,
        board,
      }),
    enabled: (params.enabled ?? true) && Boolean(board),
  });
}
