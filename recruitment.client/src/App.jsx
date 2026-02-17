import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import RootLayout from "./layout/RootLayout";
import RootJobs from "./pages/RootJobs";
import RootJobDetails from "./pages/RootJobDetails";
import PageNotFound from "./pages/PageNotFound";
import AppProviders from "./context/AppProviders";
import Login from "./auth/Login";
import AccountLayout from "./layout/AccountLayout";
import CreateAccount from "./auth/CreateAccount";
import ActivateAccount from "./auth/ActivateAccount";
import ResetPassword from "./auth/ResetPassword";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./components/Dashboard";
import Vacancies from "./components/Vacancies";
import Help from "./components/Help";
import Profile from "./components/Profile";
import UpdateProfile from "./components/UpdateProfile";
import JobDetails from "./components/JobDetails";
import AppHelp from "./components/AppHelp";
import MinimumRequirements from "./components/MinimumRequirements";
import AcademicQualifications from "./components/AcademicQualifications";
import PendingApplication from "./components/PendingApplications";
import WorkExperience from "./components/WorkExperience";
import Relationships from "./components/Relationships";
import Attachments from "./components/Attachments";
import PreviewApplication from "./components/PreviewApplication";
import ThankYouPage from "./pages/ThankYouPage";
import TrackApplications from "./components/TrackApplications";
import Recommendation from "./components/Recommendation";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Navigate to="vacancies" replace />} />
          <Route path="vacancies" element={<RootJobs />} />
          <Route path="details" element={<RootJobDetails />} />
          <Route path="help" element={<Help />} />
        </Route>

        <Route path="account" element={<AccountLayout />}>
          <Route index element={<Login />} />
          <Route path="create-account" element={<CreateAccount />} />
          <Route path="activate-account" element={<ActivateAccount />} />
          <Route path="forgot-password" element={<ResetPassword />} />
        </Route>

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="vacancies" element={<Vacancies />} />
          <Route path="profile" element={<Profile />} />
          <Route path="pending-applications" element={<PendingApplication />} />
          <Route
            path="submitted-applications"
            element={<TrackApplications />}
          />
          <Route path="update-profile" element={<UpdateProfile />} />
          <Route path="help" element={<AppHelp />} />
          <Route path="job-details" element={<JobDetails />} />
          <Route
            path="minimum-requirements"
            element={<MinimumRequirements />}
          />
          <Route
            path="academic-qualifications"
            element={<AcademicQualifications />}
          />
          <Route path="work-experience" element={<WorkExperience />} />
          <Route path="relationships" element={<Relationships />} />
          <Route path="attachments" element={<Attachments />} />
          <Route path="preview-application" element={<PreviewApplication />} />
          <Route path="thank-you" element={<ThankYouPage />} />
          <Route path="recomendations" element={<Recommendation />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </>,
    ),
  );
  return (
    <div className="text-[1.6rem]">
      {
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      }
    </div>
  );
};

export default App;
