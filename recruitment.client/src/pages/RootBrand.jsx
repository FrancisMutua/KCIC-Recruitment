import { Link, useLocation } from "react-router-dom";
import { FaChevronRight, FaHome, FaBriefcase } from "react-icons/fa";

const RootBrand = () => {
  const location = useLocation();

  // Logic to split path into breadcrumbs
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <div className="relative overflow-hidden bg-white dark:bg-primary border-b border-gray-100 dark:border-white/10 transition-colors duration-300">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-full bg-red-600/5 -skew-x-12 transform translate-x-20 hidden md:block" />

      <div className="max-w-[1440px] mx-auto md:px-12 lg:px-20 py-6 md:py-8 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        {/* Left Side: Title & Badge */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-900/20 shrink-0">
              <FaBriefcase className="text-white text-lg" />
            </div>
            <h2 className="text-gray-900 uppercase font-black tracking-tight text-base md:text-2xl">
              Recruitment <span className="text-red-600">Portal</span>
            </h2>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider ml-11 md:ml-12">
            Kenya Universities and Colleges Central Placement Service
          </p>
        </div>

        {/* Right Side: Professional Breadcrumbs */}
        <nav className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-full border border-gray-100 dark:border-white/5 shadow-sm">
          <Link
            to="/"
            className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-2 text-xs"
          >
            <FaHome />
          </Link>

          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;

            return (
              <div key={name} className="flex items-center gap-2">
                <FaChevronRight className="text-[10px] text-gray-300 dark:text-gray-600" />
                <Link
                  to={routeTo}
                  className={`capitalize text-xs font-black tracking-wide transition-colors ${
                    isLast
                      ? "text-red-600 cursor-default"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                  }`}
                >
                  {name.replace("-", " ")}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default RootBrand;
