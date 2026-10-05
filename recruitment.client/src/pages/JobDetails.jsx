
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { IconArrowLeft, IconShare } from "@tabler/icons-react";
import { useModal } from "../context/ModalContext";

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
        const result = await response.json();

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
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    
    if (!user || !user.accessToken) {
      openLogin();
    } else {
      try {
        if(!jobDetails?.jobInfo?.documentNo) {
            toast.error("Missing Job Requisition Number. Cannot apply.");
            return;
        }

        setSubmitting(true);
        
        const username = userProfile?.EmailAddress || userProfile?.emailAddress || user?.emailAddress || "";

        const payload = {
            username: username, 
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

        const result = await response.json();
        
        if (result.success) {
            toast.success("Your application has been started. Please complete the remaining details to submit it.");
            navigate(`/app/application-details/${result.data}`);
        } else {
             toast.error(result.message || "Submission failed");
        }

      } catch (err) {
          toast.error("An error occurred while applying.");
          console.error(err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <MoonLoader color="blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="bg-red-400 text-white py-3 px-6 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-brand-navy hover:underline flex items-center gap-1"
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
        className="mb-6 flex items-center gap-2 text-brand-navy hover:text-brand-navy font-medium transition-colors"
      >
        <IconArrowLeft size={20} /> Back to Jobs
      </button>

      {jobDetails && (
        <div className="bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-brand-navy to-brand-navy-700 px-4 py-2 text-white">
            <div className="flex justify-between items-start md:items-center">
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-2">
                  Job Requirements & Responsibilities
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
            <section className="grid sm:grid-cols-2 gap-4 rounded-lg bg-blue-50 p-5">
              <p><strong>Requisition type:</strong> {jobDetails.jobInfo.requisitionType || 'As advertised'}</p>
              <p><strong>Duty station:</strong> {jobDetails.jobInfo.dutyStation || 'As advertised'}</p>
              <p><strong>Basic salary:</strong> {jobDetails.jobInfo.basicSalary ? Number(jobDetails.jobInfo.basicSalary).toLocaleString() : 'As advertised'}</p>
              <p><strong>Allowances:</strong> {jobDetails.jobInfo.allowances ? Number(jobDetails.jobInfo.allowances).toLocaleString() : 'As advertised'}</p>
              <p className="sm:col-span-2"><strong>Terms of employment:</strong> {jobDetails.jobInfo.employmentTerms || 'As advertised'}</p>
            </section>
            {/* Responsibilities */}
            <section>
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-brand-navy rounded-sm"></span>
                Key Responsibilities
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                 {jobDetails.responsibilities && jobDetails.responsibilities.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {jobDetails.responsibilities.map((resp, index) => (
                        <li key={index} className="leading-relaxed pl-2">
                          <span className="-ml-2">{resp.description}</span>
                        </li>
                      ))}
                    </ul>
                 ) : (
                    <p className="text-gray-500 italic">No responsibilities listed.</p>
                 )}
              </div>
            </section>

            <div className="w-full h-px bg-gray-200"></div>

            {/* Requirements */}
            <section>
              <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-brand-navy rounded-sm"></span>
                Requirements
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                {jobDetails.requirements && jobDetails.requirements.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    {jobDetails.requirements.map((req, index) => (
                      <li key={index} className="leading-relaxed pl-2">
                         <span className="-ml-2">
                            {req.code !== 'ACADEMIC' && req.code !== 'PROFESSIONAL' ? (
                                <strong>{req.code}: </strong>
                            ) : null}
                            {req.description}
                         </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                   <p className="text-gray-500 italic">No requirements listed.</p>
                )}
              </div>
            </section>
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
