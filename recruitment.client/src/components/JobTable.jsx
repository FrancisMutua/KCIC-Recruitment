import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { IconShare } from "@tabler/icons-react";
import { toast } from "react-toastify";

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
        setAdvertisedJobs(result.data);
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

  const handleShare = (jobId) => {
    const url = `${window.location.origin}/job-details/${jobId}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Job link copied to clipboard!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      toast.error("Failed to copy link");
    });
  };

  return (
    <div>
      <h3 className="uppercase font-semibold tracking-wide text-sm md:text-2xl">
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
        <div className="w-full overflow-x-scroll">
          <table className="border-collapse w-full mt-6">
            <thead>
              <tr>
                <td className="table-header">Reference Number</td>
                <td className="table-header">Date</td>
                <td className="table-header">Job Id</td>
                <td className="table-header">Job Title</td>
                <td className="table-header">Vacancy</td>
                <td className="table-header">Start Date</td>
                <td className="table-header">End Date</td>
                <td className="table-header">Actions</td>
              </tr>
            </thead>
            <tbody>
              {advertisedJobs.length > 0 ? (
                advertisedJobs.map((job) => (
                  <tr className="table-row-custom" key={job.documentNo}>
                    <td className="table-body">{job.documentNo}</td>
                    <td className="table-body">{job.documentDate}</td>
                    <td className="table-body">{job.jobId}</td>
                    <td className="table-body">{job.jobTitle}</td>
                    <td className="table-body">{job.vacancy}</td>
                    <td className="table-body">{job.startDate}</td>
                    <td className="table-body">{job.endDate}</td>
                    <td className="table-body">
                      <div className="flex items-center gap-2">
                        <button 
                          className="bg-cyan-700 text-white px-3 py-1 rounded hover:bg-cyan-800 transition-colors"
                          onClick={() => navigate(`${basePath}/${job.jobId}`)}
                        >
                          Details
                        </button>
                        <button 
                          className="p-1.5 text-cyan-700 hover:bg-cyan-50 rounded-md transition-colors border border-cyan-100"
                          onClick={() => handleShare(job.jobId)}
                          title="Share Job"
                        >
                          <IconShare size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row-custom">
                  <td className="table-body text-center" colSpan={10}>
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobTable;
