
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { IconArrowLeft, IconShare } from "@tabler/icons-react";
import { useModal } from "../context/ModalContext";
import JobAdvertContent from "../components/JobAdvertContent";
import { fixText } from "../lib/jobAdvert";
import { readJson } from "../lib/http";

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
        const response = await fetch(`/api/job/jobrequirements?jobId=${encodeURIComponent(jobId)}&requisitionNo=${encodeURIComponent(requisitionNo)}`, {
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
        
        const response = await fetch("/api/job/submit", {
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
        <div className="bg-brand-brown-600 text-white py-3 px-6 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-brand-green-600 hover:underline flex items-center gap-1"
        >
          <IconArrowLeft size={16} /> Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="py-2 px-2 md:px-4 max-w-full mx-auto">
      <button
        onClick={() => navigate("/")}
        className="mb-6 flex items-center gap-2 text-brand-green-600 hover:text-brand-green-600 font-medium transition-colors"
      >
        <IconArrowLeft size={20} /> Back to Jobs
      </button>

      {jobDetails && (
        <div className="bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-brand-green-600 to-brand-green-700 px-4 py-2 text-white">
            <div className="flex justify-between items-start md:items-center">
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-2">
                  {fixText(jobDetails.jobInfo.jobTitle) || "Job Requirements & Responsibilities"}
                </h2>
                <p className="opacity-90">Job ID: {jobId}</p>
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

          <div className="p-8 space-y-8">
            <JobAdvertContent details={jobDetails} />
          </div>
          
           <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex justify-end">
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
