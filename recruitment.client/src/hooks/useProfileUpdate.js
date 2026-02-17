import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const useProfileUpdate = function () {
  const [hasUpdatedProfile, setHasUpdatedProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(
    function () {
      const checkUserUpdatedProfile = async function () {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/auth/hasupdatedprofile?token=${accessToken}`,
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
          setHasUpdatedProfile(result.updated);
        } catch (error) {
          toast.error(error.message);
        } finally {
          setIsLoading(false);
        }
      };
      accessToken && checkUserUpdatedProfile();
    },
    [accessToken],
  );

  return { hasUpdatedProfile, isLoading };
};
