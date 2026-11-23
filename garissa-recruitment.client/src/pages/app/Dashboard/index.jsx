import { 
  IconUsers, 
  IconMessageCircle, 
  IconBriefcase,
  IconLoader2,
  IconSend,
  IconChartBar,
  IconCalendar,
  IconFileText,
  IconCircleCheck
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import StatCard from "./components/StatCard";
import JobTable from "../../../components/JobTable";
import { apiFetch, readJson, resultError } from "../../../lib/http";
import { toast } from "react-toastify";

const iconMap = {
  TotalOpenings: IconBriefcase,
  TotalOpenPositions: IconChartBar,
  TotalApplications: IconUsers,
  SubmittedApplications: IconSend,
  SuccessfulApplications: IconCircleCheck,
};

const cardStyles = [
  { lightColorClass: "bg-brand-green-50", chartColor: "text-brand-green-600" },
  { lightColorClass: "bg-brand-lime-50", chartColor: "text-brand-forest" },
  { lightColorClass: "bg-brand-gold-50", chartColor: "text-brand-brown-600" },

];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const token = userData.accessToken;

        const response = await apiFetch("/api/dashboard/statistics", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        const data = await readJson(response);
        if (!response.ok || data.success === false) throw new Error(resultError(data, response));
        setStats(data.data);
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <IconLoader2 className="animate-spin text-brand-green-600" size={40} />
      </div>
    );
  }

  const statItems = [
    { id: "TotalOpenings", title: "Total Openings", value: stats?.totalOpenings || 0, icon: "TotalOpenings" },
    { id: "TotalApplications", title: "Total Applications", value: stats?.totalApplications || 0, icon: "TotalApplications" },
    { id: "SubmittedApplications", title: "Submitted", value: stats?.submittedApplications || 0, icon: "SubmittedApplications" },
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statItems.map((stat, index) => {
          const style = cardStyles[index % cardStyles.length];
          return (
            <StatCard 
              key={stat.id}
              title={stat.title}
              value={stat.value.toString()}
              icon={iconMap[stat.icon]}
              lightColorClass={style.lightColorClass}
              chartColor={style.chartColor}
            />
          );
        })}
      </div>

      {/* Recent Openings Table */}
      <div>
        <JobTable basePath="/app/job-details" />
      </div>
    </div>
  );
};

export default Dashboard;
