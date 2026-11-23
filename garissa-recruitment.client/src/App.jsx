import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import AppLayout from "./layout/AppLayout";
import GlobalLayout from "./layout/GlobalLayout";
import ActivateAccount from "./pages/auth/ActivateAccount";
import Dashboard from "./pages/app/Dashboard";
import Applications from "./pages/app/Applications";
import Profile from "./pages/app/Profile";
import Settings from "./pages/app/Settings";
import ProfileUpdate from "./pages/app/ProfileUpdate";
import ApplicationDetails from "./pages/app/ApplicationDetails";
import Jobs from "./pages/app/Jobs";



import JobDetails from "./pages/JobDetails";


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<GlobalLayout />}>
      <Route path="/" element={<RootLayout />}>
        <Route path="activate" element={<ActivateAccount />} />
        <Route path="job-details/:jobId" element={<JobDetails />} />
      </Route>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="applications" element={<Applications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile-update" element={<ProfileUpdate />} />
        <Route path="application-details/:applicationNo" element={<ApplicationDetails />} />
        <Route path="job-details/:jobId" element={<JobDetails />} />
      </Route>
    </Route>
  ),
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
