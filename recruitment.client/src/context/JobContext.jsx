import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const JobContext = createContext();

const JobProvider = function ({ children }) {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(function () {
    const getAdvertisedJobs = async function () {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch("/api/job/getadvertisedjobs");

        const result = await response.json();

        if (result.success === false) throw new Error(result.message);

        const avaibleJobs = result.filter(
          (job) => new Date(job.endDate) >= new Date(),
        );
        setJobs(avaibleJobs);
      } catch (error) {
        toast.error(error.message);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    getAdvertisedJobs();
  }, []);

  const getJobDetails = async function (jobId) {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/job/jobdetails?jobId=${jobId}`);

      const result = await response.json();

      if (result.success === false) throw new Error(result.message);

      setJobDetails(result);
    } catch (error) {
      toast.error(error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        isLoading,
        error,
        jobDetails,
        getJobDetails,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

/* eslint-disable */
const useJobs = function () {
  const context = useContext(JobContext);
  if (context === undefined)
    throw new Error("useJobs must be used within a JobProvider");
  return context;
};

export { JobProvider, useJobs };
