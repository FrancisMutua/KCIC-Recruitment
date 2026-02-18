import JobTable from "../components/JobTable";

const RootAdvertisedJobs = () => {
  return (
    <div className="py-8 px-6 md:px-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
         <JobTable />
      </div>
    </div>
  );
};

export default RootAdvertisedJobs;


