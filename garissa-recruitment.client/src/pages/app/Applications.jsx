import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MoonLoader } from "react-spinners";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/button";
import { fixText } from "../../lib/jobAdvert";
import { readJson } from "../../lib/http";

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.accessToken) {
            navigate("/");
            return;
        }

        const response = await fetch("/api/job/applications", {
            headers: {
                "Authorization": `Bearer ${user.accessToken}`
            }
        });
        const result = await readJson(response);

        if (result.success) {
            setApplications(result.data);
        } else {
             if(result.message) toast.error(result.message);
             setError(result.message || "Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError(error.message || "Failed to load applications.");
        toast.error(error.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const columns = useMemo(() => [
    {
      header: "Application No",
      accessorKey: "DocumentNo",
    },
    {
      header: "Job Title",
      accessorKey: "JobTitle",
      cell: ({ row }) => fixText(row.original.JobTitle) || "-",
    },
    {
      header: "Date Applied",
      accessorKey: "DocumentDate",
    },
    {
      header: "Status",
      accessorKey: "Status",
      cell: ({ row }) => {
        const status = row.original.CandidateStatus || "Draft";
        const style = {
          Draft: 'bg-brand-gold-50 text-brand-brown-700',
          Submitted: 'bg-brand-green-50 text-brand-green-800',
          'Under review': 'bg-brand-lime-100 text-brand-forest',
          'Not successful': 'bg-brand-brown-100 text-brand-brown-800',
          Closed: 'bg-gray-100 text-gray-700',
        }[status] || 'bg-brand-green-50 text-brand-green-800';
        return (
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
                {status}
            </span>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const app = row.original;
        return (
            <Button 
                size="sm"
                className="btn-primary h-8 px-3 rounded text-xs hover:opacity-90 transition-colors"
                onClick={() => navigate(`/app/application-details/${app.DocumentNo}`)}
            >
                {app.Submitted ? "Track" : "Continue"}
            </Button>
        );
      },
    },
  ], [navigate]);

  return (
    <div className="py-4 px-2 md:px-6 bg-slate-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <h3 className="uppercase font-semibold tracking-wide text-sm md:text-2xl mb-6">
            My Applications
        </h3>

        {loading && (
            <div className="flex justify-center items-center mt-4 mb-4">
            <MoonLoader color="#339966" />
            </div>
        )}

        {error && (
            <div className="flex justify-center items-center mt-4 mb-4">
            <div className="bg-brand-brown-600 text-white py-3 px-6 rounded-md">
                {error}
            </div>
            </div>
        )}

        {!loading && !error && applications.length > 0 && (
            <p className="text-sm text-gray-600 mb-4">
                Draft applications have not been sent to Garissa University yet. Open them with Continue and submit them before the advert closes.
            </p>
        )}

        {!loading && !error && (
            <DataTable columns={columns} data={applications} />
        )}
      </div>
    </div>
  );
};

export default Applications;
