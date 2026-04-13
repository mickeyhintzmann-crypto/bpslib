"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type Customer = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  postalCode: string | null;
  address: string | null;
  city: string | null;
  tags: string[];
  notes: string | null;
  source: string | null;
  leadsCount: number;
  estimatorRequestsCount: number;
  bookingsCount: number;
};

type PaginationInfo = {
  page: number;
  pageSize: number;
  total: number | null;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("da-DK", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

export function CustomersListAdmin() {
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 50,
    total: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get("q") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchQuery) {
          params.set("q", searchQuery);
        }
        params.set("page", String(pageParam));
        params.set("pageSize", "50");

        const response = await fetch(`/api/admin/customers?${params.toString()}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Fejl ved hentning af data");
        }

        const data = await response.json();
        setCustomers(data.items || []);
        setPagination({
          page: data.page || 1,
          pageSize: data.pageSize || 50,
          total: data.total
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Uventet fejl");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery, pageParam]);

  const handleSearch = (query: string) => {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    window.location.href = `/admin/customers?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    params.set("page", String(page));
    window.location.href = `/admin/customers?${params.toString()}`;
  };

  const totalPages = pagination.total ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Kunder</h1>
        <p className="text-gray-600">Oversigt over alle kunder</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Søg efter kundenavn, telefon, email eller postnr..."
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

      {/* Table */}
      {!loading && customers.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Navn</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Telefon</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Postnr</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-900">Leads</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-900">Estimater</th>
                <th className="px-6 py-3 text-center font-semibold text-gray-900">Bookinger</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-900">Seneste aktivitet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-medium text-amber-600 hover:text-amber-700 hover:underline"
                    >
                      {customer.name || "N/A"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {customer.phone || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-xs">
                    {customer.email || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {customer.postalCode || "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                      {customer.leadsCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-semibold text-xs">
                      {customer.estimatorRequestsCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                      {customer.bookingsCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    {formatDate(customer.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!loading && customers.length === 0 && !error && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-600">Ingen kunder fundet</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Forrige
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Næste
          </Button>
        </div>
      )}

      {/* Pagination info */}
      {!loading && pagination.total && pagination.total > 0 && (
        <div className="text-center text-sm text-gray-600">
          Viser {(pagination.page - 1) * pagination.pageSize + 1} til{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} af {pagination.total} kunder
        </div>
      )}
    </div>
  );
}
