const Footer = () => (
  <footer className="mt-auto border-t border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-10">
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
      <p>© {new Date().getFullYear()} Garissa University. All rights reserved.</p>
      <p>Powered by <span className="font-medium text-brand-green-700">Appkings Solutions</span></p>
    </div>
  </footer>
);

export default Footer;
