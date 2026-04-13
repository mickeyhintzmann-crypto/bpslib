"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type UnifiedItem = {
  id: string;
  type: "lead" | "estimator" | "booking";
  created_at: string;
  status: string;
  name: string;
  phone: string | null;
  email: string | null;
  priority_score: number;
  source?: string | null;
  service?: string | null;
  location?: string | null;
  ai_status?: string | null;
  customer_id?: string | null;
  follow_up_at?: string | null;
};

type PaginationInfo = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const getPriorityColor = (priority_score: number) => {
  if (priority_score >= 80) return "bg-red-500";
  if (priority_score >= 60) return "bg-orange-500";
  return "bg-gray-400";
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "lead":
      return "bg-blue-100 text-blue-800";
    case "estimator":
      return "bg-purple-100 text-purple-800";
    case "booking":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "lead":
      return "Lead";
    case "estimator":
      return "Estimat";
    case "booking":
      return "Booking";
    default:
      return type;
  }
};

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds}s siden`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m siden`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}t ${minutes % 60}m siden`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d siden`;
};

export function UnifiedInboxAdmin() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeFilter = searchParams.get("type") || "all";
  const searchQuery = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const counts = useMemo(() => {
    return {
      all: pagination.total,
      leads: items.filter((i) => i.type === "lead").length,
      estimator: items.filter((i) => i.type === "estimator").length,
      booking: items.filter((i) => i.type === "booking").length
    };
  }, [items, pagination.total]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (typeFilter && typeFilter !== "all") {
          params.set("type", typeFilter);
        }
        if (searchQuery) {
          params.set("q", searchQuery);
        }
        params.set("page", String(pageParam));
        params.set("pageSize", "20");

        const response = await fetch(`/api/admin/inbox?${params.toString()}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Fejl ved hentning af data");
        }

        const data = await response.json();
        setItems(data.items || []);
        setPagination(data.pagination || {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Uventet fejl");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [typeFilter, searchQuery, pageParam]);

  const handleTabClick = (type: string) => {
    const params = new URLSearchParams();
    if (type !== "all") {
      params.set("type", type);
    }
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    window.location.href = `/admin/inbox?${params.toString()}`;
  };

  const handleSearch = (query: string) => {
    const params = new URLSearchParams();
    if (typeFilter && typeFilter !== "all") {
      params.set("type", typeFilter);
    }
    if (query) {
      params.set("q", query);
    }
    window.location.href = `/admin/inbox?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (typeFilter && typeFilter !== "all") {
      params.set("type", typeFilter);
    }
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    params.set("page", String(page));
    window.location.href = `/admin/inbox?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Samlet indbakke</h1>
        <p className="text-gray-600">Oversigt over alle leads, estimater og bookinger</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Søg efter kunde, telefon eller email..."
          defaultValue={searchQuery}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch((e.target as HTMLInputElement).value);
            }
          }}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <Button
          onClick={() => {
            const input = document.querySelector("input[placeholder*='Søg']") as HTMLInputElement;
            if (input) {
              handleSearch(input.value);
            }
          }}
          variant="outline"
        >
          Søg
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => handleTabClick("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            typeFilter === "all"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Alle <span className="ml-1 text-gray-500">({counts.all})</span>
        </button>
        <button
          onClick={() => handleTabClick("lead")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            typeFilter === "lead"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Leads <span className="ml-1 text-gray-500">({counts.leads})</span>
        </button>
        <button
          onClick={() => handleTabClick("estimator")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            typeFilter === "estimator"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Estimater <span className="ml-1 text-gray-500">({counts.estimator})</span>
        </button>
        <button
          onClick={() => handleTabClick("booking")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            typeFilter === "booking"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Bookinger <span className="ml-1 text-gray-500">({counts.booking})</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Henter data...</div>
        </div>
      )}

      {/* Items list */}
      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="rounded-lg border border-gray-200 p-4 hover:border-amber-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                {/* Left side: priority + type + content */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Priority indicator */}
                  <div
                    className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${getPriorityColor(item.priority_score)}`}
                    title={`Priority: ${item.priority_score.toFixed(0)}`}
                  />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {/* Type badge */}
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>

                      {/* Status badge */}
                      {item.status && (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.status}
                        </span>
                      )}
                    </div>

                    {/* Name and contact */}
                    <div className="mb-2">
                      {item.customer_id ? (
                        <Link
                          href={`/admin/customers/${item.customer_id}`}
                          className="text-sm font-semibold text-amber-600 hover:text-amber-700 hover:underline"
                        >
                          {item.name || "N/A"}
                        </Link>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900">{item.name || "N/A"}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {item.phone && <span>{item.phone}</span>}
                        {item.phone && item.email && <span> • </span>}
                        {item.email && <span className="truncate">{item.email}</span>}
                      </p>
                    </div>

                    {/* Service and location */}
                    <p className="text-sm text-gray-500">
                      {item.service && <span>{item.service}</span>}
                      {item.service && item.location && <span> • </span>}
                      {item.location && <span>{item.location}</span>}
                    </p>
                  </div>
                </div>

                {/* Right side: time since created */}
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-500">{formatTimeAgo(item.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && !error && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-600">Ingen henvendelser fundet</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Forrige
          </Button>

          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const startPage = Math.max(1, pagination.page - 2);
            const pageNum = startPage + i;
            return (
              <Button
                key={pageNum}
                variant={pagination.page === pageNum ? "default" : "outline"}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Næste
          </Button>
        </div>
      )}

      {/* Pagination info */}
      {!loading && pagination.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Viser {(pagination.page - 1) * pagination.pageSize + 1} til{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} af {pagination.total} henvendelser
        </div>
      )}
    </div>
  );
}
