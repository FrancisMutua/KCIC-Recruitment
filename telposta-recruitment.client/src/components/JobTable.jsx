import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { IconShare, IconEye } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { DataTable } from "./ui/DataTable";
import { Button } from "./ui/button";
import { fixText } from "../lib/jobAdvert";

const JobTable = ({ basePath = "/job-details" }) => {
  const [advertisedJobs, setAdvertisedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(function () {
    const controller = new AbortController();
    const signal = controller.signal;

    const getAdvertisedJobs = async function () {
      try {
        setLoading(true);
        const response = await fetch("/api/job/advertisedjobs", { signal });
        const result = await response.json();
        if (result.success === false) throw new Error(result.message);
        setAdvertisedJobs(result.data ?? []);
        setError("");
      } catch (error) {
        if (error.name !== "AbortError") {
             setError(error.message);
        }
      } finally {
        if (!signal.aborted) {
            setLoading(false);
        }
      }
    };
    getAdvertisedJobs();

    return () => {
        controller.abort();
    };
  }, []);

  const handleShare = (jobId, requisitionNo) => {
    const url = `${window.location.origin}/job-details/${encodeURIComponent(jobId)}?requisitionNo=${encodeURIComponent(requisitionNo)}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Job link copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy link");
    });
  };

  const columns = useMemo(() => [
    {
      header: "Reference Number",
      accessorKey: "documentNo",
    },
    {
      header: "Date",
      accessorKey: "documentDate",
    },
    {
      header: "Job Id",
      accessorKey: "jobId",
    },
    {
      header: "Job Title",
      accessorKey: "jobTitle",
      cell: ({ row }) => fixText(row.original.jobTitle) || "-",
    },
    {
      header: "Vacancy",
      accessorKey: "vacancy",
    },
    {
      header: "Start Date",
      accessorKey: "startDate",
    },
    {
      header: "End Date",
      accessorKey: "endDate",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const job = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
                size="sm"
                className="btn-primary h-8 px-3 rounded text-xs hover:opacity-90 transition-colors"
                onClick={() => navigate(`${basePath}/${encodeURIComponent(job.jobId)}?requisitionNo=${encodeURIComponent(job.documentNo)}`)}
            >
                Details
            </Button>
            <button 
              className="p-1.5 text-brand-navy hover:bg-brand-navy rounded-md transition-colors border border-brand-navy"
              onClick={() => handleShare(job.jobId, job.documentNo)}
              title="Share Job"
            >
              <IconShare size={16} />
            </button>
          </div>
        );
      },
    },
  ], [basePath, navigate]);

  return (
    <div>
      <h3 className="uppercase font-semibold tracking-wide text-sm md:text-2xl mb-4">
        Advertised Jobs
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
        <DataTable columns={columns} data={advertisedJobs} />
      )}
    </div>
  );
};

export default JobTable;
