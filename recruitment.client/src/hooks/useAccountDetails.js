import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const useAccountDetails = function () {
  const [isLoading, setIsLoading] = useState(false);
  const [account, setAccount] = useState({});

  useEffect(function () {
    const accessToken = localStorage.getItem("accessToken");
    const getUserDetails = async function () {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/auth/getuserdetails?token=${accessToken}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const result = await response.json();
        if (result.success === false) throw new Error(result.message);
        setAccount(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    accessToken && getUserDetails();
  }, []);

  return { account, isLoading };
};
