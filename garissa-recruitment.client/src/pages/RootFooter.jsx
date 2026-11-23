const RootFooter = () => (
  <footer className="border-t border-slate-200 bg-white">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
      <p>© {new Date().getFullYear()} Garissa University. All rights reserved.</p>
      <p>
        Powered by{" "}
        <a href="https://www.appkings.co.ke" target="_blank" rel="noreferrer" className="font-medium text-brand-green-700 hover:underline">
          Appkings Solutions Limited
        </a>
      </p>
    </div>
  </footer>
);

export default RootFooter;
