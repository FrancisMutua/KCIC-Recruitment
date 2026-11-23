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
import { readJson } from "../../../lib/http";

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

        const response = await fetch("/api/dashboard/statistics", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch statistics");

        const data = await readJson(response);
        setStats(data.data);
      } catch (error) {
        console.error("Dashboard error:", error);
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
    <div className="space-y-12 py-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
      <div className="mt-8">
        <JobTable basePath="/app/job-details" />
      </div>
    </div>
  );
};

export default Dashboard;
