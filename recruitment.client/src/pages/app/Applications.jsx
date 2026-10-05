import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MoonLoader } from "react-spinners";
import { DataTable } from "../../components/ui/DataTable";
import { Button } from "../../components/ui/button";

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
        const result = await response.json();

        if (result.success) {
            setApplications(result.data);
        } else {
             if(result.message) toast.error(result.message);
             setError(result.message || "Failed to fetch applications");
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setError("Failed to load applications.");
        toast.error("Failed to load applications.");
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
      cell: ({ row }) => row.original.JobTitle || "-",
    },
    {
      header: "Date Applied",
      accessorKey: "DocumentDate",
    },
    {
      header: "Status",
      accessorKey: "Status",
      cell: ({ row }) => {
        const app = row.original;
        return (
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                app.Status === 'Open' ? 'bg-yellow-100 text-yellow-800' : 
                app.Status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
            }`}>
                {app.CandidateStatus || (app.Status === 'Open' ? 'Draft' : app.Status)}
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
                Details
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
            <MoonLoader color="blue" />
            </div>
        )}

        {error && (
            <div className="flex justify-center items-center mt-4 mb-4">
            <div className="bg-red-400 text-white py-3 px-6 rounded-md">
                {error}
            </div>
            </div>
        )}

        {!loading && !error && (
            <DataTable columns={columns} data={applications} />
        )}
      </div>
    </div>
  );
};

export default Applications;
