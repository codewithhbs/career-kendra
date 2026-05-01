import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ya react-router se useNavigate
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import axios from "axios"; // ya apna api util
import Swal from "sweetalert2";
import { API_URL } from "@/constant/api";

interface Company {
  id: number;
  companyName: string;
  companyTagline?: string;
  companyCategory?: string;
  companySize?: string;
  foundedYear?: number;
  companyStatus: string;
  city?: string;
  state?: string;
  country?: string;
  companyLogo?: string;
  employerRole?: string;
  employer?: { employerName: string; employerEmail: string };
}

const ManageCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const router = useRouter();
  const fetchCompanyList = useEmployerAuthStore(
    (state) => state.fetchCompanyList,
  );

  const handleFetchCompanies = async () => {
    try {
      const res = await fetchCompanyList();
      if (res?.notFound) {
        setCompanies([]);
        return;
      }
      setCompanies(res || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    handleFetchCompanies();
  }, []);

  const handleDeleteCompany = async (company: Company) => {
    const result = await Swal.fire({
      title: "Delete Company?",
      text: `"${company.companyName}" ko permanently delete karna chahte ho?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Haan, delete karo!",
    });

    if (!result.isConfirmed) return;

    try {
      const { token } = useEmployerAuthStore.getState();
      await axios.delete(`${API_URL}/company/delete-company/${company.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 2000,
        showConfirmButton: false,
      });
      handleFetchCompanies();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete company",
      });
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a1a" }}>
          Manage Companies
        </h2>
        <span
          style={{
            background: "#F29104",
            color: "#fff",
            padding: "3px 12px",
            borderRadius: 20,
            fontSize: 12,
          }}
        >
          {companies.length} {companies.length === 1 ? "Company" : "Companies"}
        </span>
      </div>

      {companies.length === 0 ? (
        <p style={{ textAlign: "center", color: "#aaa", marginTop: 60 }}>
          No companies found
        </p>
      ) : (
        companies.map((company) => (
          <div
            key={company.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #eee",
              padding: 20,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Logo / Initials */}
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                background: "#fef3e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                color: "#F29104",
                flexShrink: 0,
              }}
            >
              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  width={56}
                  height={56}
                  style={{ borderRadius: 10, objectFit: "cover" }}
                />
              ) : (
                getInitials(company.companyName)
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
                {company.companyName}
              </div>
              {company.companyTagline && (
                <div style={{ fontSize: 13, color: "#777", marginTop: 2 }}>
                  {company.companyTagline}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {[
                  company.companyCategory,
                  company.companySize && `${company.companySize} emp`,
                  company.foundedYear,
                ]
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        background: "#fef3e0",
                        color: "#b36800",
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 10px",
                    borderRadius: 20,
                    background:
                      company.companyStatus === "active"
                        ? "#e8f5e9"
                        : "#fff3e0",
                    color:
                      company.companyStatus === "active"
                        ? "#2e7d32"
                        : "#e65100",
                  }}
                >
                  {company.companyStatus}
                </span>
              </div>
              {company.city && (
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                  {company.city}, {company.state}, {company.country}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button
                onClick={() =>
                  router.push(
                    `/employer/profile?tab=update-company&id=${company.id}`,
                  )
                }
                style={{
                  background: "#F29104",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 18px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Update ›
              </button>

              <button
                onClick={() => handleDeleteCompany(company)}
                style={{
                  background: "#fff",
                  color: "#ef4444",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fef2f2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#fff")
                }
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ManageCompanies;
