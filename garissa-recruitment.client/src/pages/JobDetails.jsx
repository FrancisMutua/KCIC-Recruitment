
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { IconArrowLeft, IconShare } from "@tabler/icons-react";
import { useModal } from "../context/ModalContext";
import JobAdvertContent from "../components/JobAdvertContent";
import { fixText } from "../lib/jobAdvert";
import { apiFetch, readJson } from "../lib/http";

const JobDetails = () => {
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const requisitionNo = searchParams.get("requisitionNo") || "";
  const navigate = useNavigate();
  const [jobDetails, setJobDetails] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/api/job/jobrequirements?jobId=${encodeURIComponent(jobId)}&requisitionNo=${encodeURIComponent(requisitionNo)}`, {
          signal,
        });
        const result = await readJson(response);

        if (result.success === false) throw new Error(result.message);
        setJobDetails(result.data);
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

    if (jobId) {
      fetchJobDetails();
    }

    return () => {
      controller.abort();
    };
  }, [jobId, requisitionNo]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Job link copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy link");
    });
  };

  const { openLogin } = useModal();

  const handleApply = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.accessToken) {
      openLogin();
    } else {
      try {
        if(!jobDetails?.jobInfo?.documentNo) {
            toast.error("Missing Job Requisition Number. Cannot apply.");
            return;
        }

        setSubmitting(true);
        
        const payload = {
            jobId: jobId,
            requisitionNo: jobDetails.jobInfo.documentNo
        };
        
        const response = await apiFetch("/api/job/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.accessToken}`
            },
            body: JSON.stringify(payload)
        });

        const result = await readJson(response);
        
        if (result.success) {
            toast.success("Your application is open. Complete each step and submit it before the advert closes.");
            navigate(`/app/application-details/${result.data}`);
        } else {
             toast.error(result.message || "Submission failed");
        }

      } catch (err) {
          toast.error(err.message || "An error occurred while applying.");
          console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <MoonLoader color="#339966" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div role="alert" className="mb-4 max-w-xl rounded-2xl border border-brand-brown-200 bg-brand-brown-50 px-5 py-4 text-sm text-brand-brown-800">
          {error}
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 font-semibold text-brand-green-700 hover:underline"
        >
          <IconArrowLeft size={16} /> Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-8">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 font-semibold text-brand-green-700 transition-colors hover:bg-brand-green-50"
      >
        <IconArrowLeft size={20} /> Back to Jobs
      </button>

      {jobDetails && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="bg-hero px-6 py-7 text-white md:px-8">
            <div className="flex justify-between items-start md:items-center">
              <div>
                <h2 className="mb-2 text-xl font-bold text-white md:text-3xl">
                  {fixText(jobDetails.jobInfo.jobTitle) || "Job Requirements & Responsibilities"}
                </h2>
                <p className="text-sm text-white/75">Job ID: {jobId}</p>
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-colors border border-white/20"
                title="Share Job"
              >
                <IconShare size={20} />
                <span className="hidden md:inline font-medium">Share</span>
              </button>
            </div>
          </div>

          <div className="space-y-8 p-6 md:p-8">
            <JobAdvertContent details={jobDetails} />
          </div>
          
           <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-5 md:px-8">
              <button 
                onClick={handleApply}
                disabled={submitting}
                className={`btn-primary px-6 py-2.5 rounded-lg shadow-sm hover:opacity-90 transition-colors font-semibold flex items-center gap-2 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {submitting && <MoonLoader size={16} color="#ffffff" />}
                {submitting ? "Submitting..." : "Apply Now"}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
