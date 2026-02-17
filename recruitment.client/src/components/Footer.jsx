const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#00171f] border-t border-white/5 px-6 md:px-12 py-5 mt-auto transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* LEFT SIDE: Branding & System Status */}
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <p className="text-gray-400 text-sm font-medium">
            &copy; {currentYear}{" "}
            <span className="text-white font-black uppercase tracking-tight">
              KUCCPS
            </span>{" "}
            Recruitment Portal
          </p>

          {/* Vertical Divider (Desktop Only) */}
          <span className="hidden md:block h-4 w-[1px] bg-white/10"></span>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            <span className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black leading-none">
              System Online
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Credit */}
        <div className="flex items-center">
          <p className="text-gray-500 text-xs font-medium">
            Powered by{" "}
            <a
              href="https://www.appkings.co.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 font-bold hover:text-red-400 transition-all underline-offset-4 hover:underline"
            >
              Appkings Solutions Limited
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
