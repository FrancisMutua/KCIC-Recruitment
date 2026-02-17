import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useApplications = function () {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("accessToken");

  // 1. Wrap the fetch logic in useCallback so it can be called manually
  const fetchApplications = useCallback(
    async function () {
      if (!token) return; // Guard clause if token isn't available yet

      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/job/getapplications?token=${token}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (result.success === false) throw new Error(result.message);
        setApplications(result);
      } catch (error) {
        // Only show toast if it's a real error (ignoring expected unauthorized on logout)
        if (error.message !== "Failed to fetch") {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [token],
  ); // Function updates only if token changes

  // 2. Initial fetch on mount or when token changes
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // 3. Return the function as 'refreshApplications'
  return {
    applications,
    isLoading,
    refreshApplications: fetchApplications,
  };
};
