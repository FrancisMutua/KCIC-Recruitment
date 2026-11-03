const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-6 px-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-auto w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500">
          &copy; {currentYear} TelPosta Pension Scheme. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-slate-400">
            Powered By <span className="text-brand-green-600 font-semibold italic">Appking @2026</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
