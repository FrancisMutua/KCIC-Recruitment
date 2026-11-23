import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { IconShare, IconEye } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { DataTable } from "./ui/DataTable";
import { Button } from "./ui/button";
import { fixText } from "../lib/jobAdvert";
import { apiFetch, readJson } from "../lib/http";

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
        const response = await apiFetch("/api/job/advertisedjobs", { signal });
        const result = await readJson(response);
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
      cell: ({ row }) => <span className="font-semibold text-slate-900">{fixText(row.original.jobTitle) || "-"}</span>,
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
                className="btn-primary h-8 rounded-lg px-3 text-xs"
                onClick={() => navigate(`${basePath}/${encodeURIComponent(job.jobId)}?requisitionNo=${encodeURIComponent(job.documentNo)}`)}
            >
                Details
            </Button>
            <button 
              className="rounded-lg border border-slate-300 p-1.5 text-brand-green-700 transition-colors hover:border-brand-green hover:bg-brand-green-50"
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
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-slate-900 md:text-2xl">Advertised Jobs</h3>
          <p className="mt-1 text-sm text-slate-500">Positions currently open for applications at Garissa University.</p>
        </div>
        {!loading && !error && (
          <span className="hidden shrink-0 rounded-full bg-brand-green-50 px-3 py-1 text-xs font-semibold text-brand-green-800 ring-1 ring-inset ring-brand-green-200 sm:inline-flex">
            {advertisedJobs.length} open
          </span>
        )}
      </div>
      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-12 shadow-sm">
          <MoonLoader color="#339966" size={36} />
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-2xl border border-brand-brown-200 bg-brand-brown-50 px-5 py-4 text-sm text-brand-brown-800">
          <p className="font-semibold">Advertised jobs could not be loaded</p>
          <p className="mt-1 break-words">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <DataTable columns={columns} data={advertisedJobs} />
      )}
    </div>
  );
};

export default JobTable;
