import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const AccountContext = createContext();

const AccountProviver = function ({ children }) {
  const [isCountryLoading, setIsCountryLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [isTribeLoading, setIsTribeLoading] = useState(false);
  const [ethnicity, setEthnicity] = useState([]);
  const [isCountyLoading, setIsCountyLoading] = useState(false);
  const [counties, setCounties] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isAreaOfStudyLading, setIsAreaOfStudyLoading] = useState(false);
  const [areaOfStudy, setAreaOfStudy] = useState([]);
  const [isQualificationLoading, setIsQualificationLoading] = useState(false);
  const [courseTypes, setCourseTypes] = useState([]);

  const handleLogout = function () {
    localStorage.removeItem("accessToken");
  };

  useEffect(function () {
    const fetchCountries = async function () {
      try {
        setIsCountryLoading(true);
        const response = await fetch("/api/settings/getcountries");
        const result = await response.json();
        if (result.success === false) throw new Error(result.message);
        setCountries(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsCountryLoading(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(function () {
    const fetchEthnicity = async function () {
      try {
        setIsTribeLoading(true);
        const response = await fetch("/api/settings/getethnicity");
        const result = await response.json();
        if (result.success === false) throw new Error(result.message);
        setEthnicity(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsTribeLoading(false);
      }
    };
    fetchEthnicity();
  }, []);

  useEffect(function () {
    const fetCounties = async function () {
      try {
        setIsCountyLoading(true);
        const response = await fetch("/api/settings/getcounties");
        const result = await response.json();
        if (result.success === false) throw new Error(result.message);
        setCounties(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsCountyLoading(false);
      }
    };
    fetCounties();
  }, []);

  useEffect(function () {
    const fetchAreasOfStudy = async function () {
      try {
        setIsAreaOfStudyLoading(true);
        const response = await fetch("/api/settings/getareasofstudy");
        const result = await response.json();
        if (result.success === false) throw new Error(result.message);
        setAreaOfStudy(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsAreaOfStudyLoading(false);
      }
    };
    fetchAreasOfStudy();
  }, []);

  useEffect(function () {
    const fetchQualifications = async function () {
      try {
        setIsQualificationLoading(true);
        const response = await fetch("/api/settings/getqualifications");
        const result = await response.json();
        if (result.success === false) throw new Error(result.message);
        setCourseTypes(result);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsQualificationLoading(false);
      }
    };
    fetchQualifications();
  }, []);

  const updateUserProfile = async function (user, token) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/auth/updateuserprofile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });
      const result = await response.json();
      if (result.success === false) throw new Error(result.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AccountContext.Provider
      value={{
        handleLogout,
        isCountryLoading,
        countries,
        isTribeLoading,
        ethnicity,
        isCountyLoading,
        counties,
        isLoading,
        updateUserProfile,
        isAreaOfStudyLading,
        areaOfStudy,
        isQualificationLoading,
        courseTypes,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

/* eslint-disable */
const useAccount = () => useContext(AccountContext);

export { AccountProviver, useAccount };
