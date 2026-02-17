import { FaHeart, FaExternalLinkAlt } from "react-icons/fa";

const RootFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#00171f] border-t border-white/10 mt-auto transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Left Side: Copyright */}
          <div className="text-center md:text-left space-y-1">
            <p className="text-white font-semibold text-sm md:text-base">
              &copy; {currentYear}{" "}
              <span className="text-red-500 font-bold">KUCCPS</span> Recruitment
              Portal
            </p>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-black">
              Official Placement Service
            </p>
          </div>

          {/* Right Side: Powered By */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <span>Developed with</span>
              <FaHeart className="text-red-600 animate-pulse text-[10px]" />
              <span>by</span>
            </div>
            <a
              href="https://www.appkings.co.ke"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-4 py-1.5 rounded-lg transition-all"
            >
              <span className="text-red-400 group-hover:text-red-300 font-bold text-xs md:text-sm">
                Appkings Solutions Limited
              </span>
              <FaExternalLinkAlt className="text-[10px] text-gray-600 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-500 text-[11px] font-medium italic tracking-wide">
            Providing accessible and equitable career opportunities for all.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default RootFooter;
