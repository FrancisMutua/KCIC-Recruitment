import {
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaArrowRight,
  FaUserEdit,
  FaCalendarCheck,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAccountDetails } from "../hooks/useAccountDetails";
import { useEffect } from "react";
import { changeDocumentTitle } from "../scripts/script";

const Dashboard = () => {
  const navigate = useNavigate();
  const { account, isLoading: isAccountLoading } = useAccountDetails();

  const stats = [
    {
      label: "Total Applications",
      value: "12",
      icon: <FaBriefcase />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Shortlisted",
      value: "03",
      icon: <FaCheckCircle />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Under Review",
      value: "07",
      icon: <FaClock />,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      label: "Declined",
      value: "02",
      icon: <FaExclamationCircle />,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  const recentApplications = [
    {
      id: 1,
      ref: "KU/24/01",
      position: "Senior Accountant",
      dept: "Finance",
      type: "Full-time",
      loc: "Nairobi",
      date: "Oct 24",
      deadline: "Nov 10",
      status: "Shortlisted",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      id: 2,
      ref: "KU/24/05",
      position: "Software Developer",
      dept: "ICT",
      type: "Contract",
      loc: "Remote",
      date: "Oct 20",
      deadline: "Nov 15",
      status: "Under Review",
      statusColor: "bg-blue-100 text-blue-700",
    },
    {
      id: 3,
      ref: "KU/24/09",
      position: "HR Business Partner",
      dept: "Human Resource",
      type: "Full-time",
      loc: "Mombasa",
      date: "Oct 15",
      deadline: "Nov 01",
      status: "Pending",
      statusColor: "bg-gray-100 text-gray-600",
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      title: "Panel Interview",
      position: "Senior Accountant",
      date: "Nov 05",
      time: "10:30 AM",
    },
    {
      id: 2,
      title: "Technical Assessment",
      position: "Software Developer",
      date: "Nov 08",
      time: "02:00 PM",
    },
  ];

  useEffect(() => {
    changeDocumentTitle("Dashboard");
    return () =>
      changeDocumentTitle(
        "The Kenya Universities and Colleges Central Placement Service",
      );
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-50/30 min-h-screen animate-in fade-in duration-700">
      {/* 1. WELCOME BANNER */}
      <div className="relative bg-[#00171f] rounded-[2rem] p-6 md:p-10 overflow-hidden shadow-2xl group">
        {/* --- ANIMATED BACKGROUND IMAGE --- */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
            alt="Dashboard Background"
            className="w-full h-full object-cover opacity-30 animate-slow-pan"
          />
          {/* Professional Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#00171f] via-[#00171f]/80 to-transparent"></div>
        </div>

        {/* Existing Red Decorative Element - Elevated Z-index */}
        <div className="absolute top-0 right-0 w-64 h-full bg-red-600/10 -skew-x-12 transform translate-x-20 z-1" />

        {/* --- CONTENT LAYER --- */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
              Welcome Back,{" "}
              {isAccountLoading ? (
                <span className="opacity-50">...</span>
              ) : (
                <span className="text-red-500 drop-shadow-md">
                  {account?.firstName}!
                </span>
              )}
            </h1>
            <p className="text-gray-300 text-xs md:text-sm font-medium max-w-sm leading-relaxed">
              Manage your applications and track recruitment progress with the
              KUCCPS official portal.
            </p>
          </div>

          <button
            className="flex items-center gap-2 bg-white text-[#00171f] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 border border-white/20 backdrop-blur-sm"
            onClick={() => navigate("/app/update-profile")}
          >
            <FaUserEdit className="text-sm" /> Update Profile
          </button>
        </div>
      </div>

      {/* 2. STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-4"
          >
            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl text-xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-[#00171f] leading-none">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 3. RECENT APPLICATIONS TABLE */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg md:text-xl font-black text-[#00171f] tracking-tight uppercase">
              Recent Applications
            </h3>
            <button className="text-red-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <FaArrowRight size={8} />
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  {[
                    "Reference",
                    "Position",
                    "Department",
                    "Type",
                    "Location",
                    "Applied",
                    "Deadline",
                    "Status",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentApplications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 text-[10px] font-mono font-bold text-blue-600">
                      {app.ref}
                    </td>
                    <td className="px-6 py-4 text-xs font-black text-[#00171f] group-hover:text-red-600 transition-colors">
                      {app.position}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-bold uppercase tracking-tighter">
                      {app.dept}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-gray-500 font-medium">
                      {app.type}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-gray-400 font-medium italic">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt size={8} /> {app.loc}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-gray-500 font-medium">
                      {app.date}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-red-400 font-bold">
                      {app.deadline}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${app.statusColor}`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. SIDEBAR - INTERVIEWS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[2rem] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base md:text-lg font-black text-[#00171f] uppercase tracking-tight">
                Interviews
              </h3>
              <FaCalendarCheck className="text-red-600" />
            </div>
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="bg-white p-2 rounded-xl shadow-sm text-center min-w-[48px]">
                    <p className="text-sm font-black text-red-600 leading-none">
                      {interview.date.split(" ")[1]}
                    </p>
                    <p className="text-[9px] font-black text-gray-400 uppercase">
                      {interview.date.split(" ")[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#00171f] leading-tight">
                      {interview.position}
                    </p>
                    <p className="text-[10px] text-red-600 font-bold mt-0.5 uppercase tracking-wider">
                      {interview.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
