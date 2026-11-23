import JobTable from "../components/JobTable";

const RootAdvertisedJobs = () => (
  <section id="open-positions" className="scroll-mt-20 py-10 sm:py-14">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <JobTable />
    </div>
  </section>
);

export default RootAdvertisedJobs;
