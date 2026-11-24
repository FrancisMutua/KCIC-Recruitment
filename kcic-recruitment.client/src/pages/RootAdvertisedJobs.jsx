import JobTable from "../components/JobTable";

const RootAdvertisedJobs = () => {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <JobTable />
      </div>
    </div>
  );
};

export default RootAdvertisedJobs;
