import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAnalytics,
  getAdminAnalytics,
  getTasks,
  getUsers,
} from "../services/taskService";
import toast from "react-hot-toast";
import { dashboardStyles as styles } from "./styles";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Trophy, 
  TrendingUp 
} from "./Icons";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0,
    totalUsers: 0,
    statusData: [],
    priorityData: [],
    userPerformance: [],
  });

  const [loading, setLoading] = useState(true);
  const role = (localStorage.getItem("role") || "user").toLowerCase();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);

      let res =
        role === "admin"
          ? await getAdminAnalytics()
          : await getAnalytics();

      if (res?.data) {
        let finalData = { ...res.data };

        if (role === "admin") {
          const [taskRes, userRes] = await Promise.all([
            getTasks(),
            getUsers(),
          ]);

          if (taskRes?.data && userRes?.data) {
            const allTasks = taskRes.data;
            const allUsers = userRes.data;

            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);

            finalData.userPerformance = allUsers
              .map((u) => {
                const userTasks = allTasks.filter(
                  (t) => (t.user?._id || t.user) === u._id
                );

                const completedTasks = userTasks.filter(
                  (t) => t.status === "completed"
                );

                const weeklyCompleted = completedTasks.filter(
                  (t) =>
                    new Date(t.updatedAt || t.createdAt) >= weekAgo
                ).length;

                return {
                  name: u.name,
                  total: userTasks.length,
                  weeklyCompleted,
                  rate:
                    userTasks.length === 0
                      ? 0
                      : Math.round(
                          (completedTasks.length / userTasks.length) * 100
                        ),
                };
              })
              .sort(
                (a, b) =>
                  b.weeklyCompleted - a.weeklyCompleted || b.rate - a.rate
              );

            // Status Data
            const comp = allTasks.filter((t) => t.status === "completed").length;
            const prog = allTasks.filter((t) => t.status === "in-progress").length;
            const pend = allTasks.filter((t) => t.status === "pending").length;

            finalData.statusData = [
              { name: "Completed", value: comp, color: "#10b981" },
              { name: "In Progress", value: prog, color: "#8e2de2" },
              { name: "Pending", value: pend, color: "#f59e0b" },
            ];

            // Priority Data
            finalData.priorityData = [
              { name: "High", count: allTasks.filter((t) => t.priority === "high").length, fill: "#ef4444" },
              { name: "Medium", count: allTasks.filter((t) => t.priority === "medium").length, fill: "#f59e0b" },
              { name: "Low", count: allTasks.filter((t) => t.priority === "low").length, fill: "#10b981" },
            ];

            finalData.total = allTasks.length;
            finalData.totalUsers = allUsers.length;
          }
        } else {
            // User view status data
            const comp = finalData.completed || 0;
            const prog = finalData.inProgress || 0;
            const pend = finalData.pending || 0;
            
            finalData.statusData = [
                { name: "Completed", value: comp, color: "#10b981" },
                { name: "In Progress", value: prog, color: "#8e2de2" },
                { name: "Pending", value: pend, color: "#f59e0b" },
            ];
        }

        setStats(finalData);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load metrics ❌");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/");
    loadStats();
  }, [navigate, loadStats]);

  const kpis = [
    { label: "Total Tasks", value: stats.total, icon: <Trophy size={22} />, color: "#6366f1" },
    { label: "Completed", value: stats.completed, icon: <CheckCircle size={22} />, color: "#10b981" },
    { label: "In Progress", value: stats.inProgress, icon: <Clock size={22} />, color: "#8e2de2" },
    { label: "Pending", value: stats.pending, icon: <AlertCircle size={22} />, color: "#f59e0b" },
    { label: "Success Rate", value: `${stats.completionRate}%`, icon: <TrendingUp size={22} />, color: "#8e2de2" },
    ...(role === "admin" ? [
      { label: "Active Users", value: stats.totalUsers, icon: <Users size={22} />, color: "#6366f1" }
    ] : [])
  ];

  if (loading) return (
    <div style={styles.loading}>
      <h2 style={{ animation: "pulse 1.5s infinite" }}>Analyzing Metrics...</h2>
    </div>
  );

  return (
    <div style={styles.pageWrap}>
      
      <div style={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <div key={i} style={styles.kpiCard}>
            <div style={{...styles.kpiIcon, color: k.color, background: `${k.color}15`}}>{k.icon}</div>
            <div style={styles.kpiInfo}>
              <p style={styles.kpiLabel}>{k.label}</p>
              <h3 style={styles.kpiValue}>{k.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {role === "admin" && stats.userPerformance?.[0] && (
        <div style={styles.topPerformerCard}>
          <div style={styles.topPerformerIcon}><Trophy size={50} color="white" /></div>
          <div style={styles.topPerformerInfo}>
            <p style={styles.topPerformerTitle}>Weekly Top Performer</p>
            <h2 style={styles.topPerformerName}>{stats.userPerformance[0].name}</h2>
            <div style={styles.topPerformerMeta}>
               <span>🔥 {stats.userPerformance[0].weeklyCompleted} tasks this week</span>
               <span style={styles.topDivider}>|</span>
               <span>🎯 {stats.userPerformance[0].rate}% Success Rate</span>
            </div>
          </div>
        </div>
      )}

      <div style={styles.dashboardContent}>
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.sectionTitle}><TrendingUp size={18} style={{marginRight: 8}} /> Status Distribution</h3>
            <div style={styles.barContainer}>
              {stats.statusData.map((s, i) => {
                const total = stats.statusData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = total === 0 ? 0 : (s.value / total) * 100;
                return (
                  <div key={i} style={styles.barItem}>
                    <span style={styles.barLabel}>{s.name}</span>
                    <div style={styles.barTrack}>
                      <div style={{ ...styles.barFill, width: `${percent}%`, background: s.color }} />
                    </div>
                    <span style={styles.barValue}>{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.sectionTitle}><span>🎯</span> Priority Breakdown</h3>
            <div style={styles.pieContainer}>
               <div style={styles.donutWrapper}>
                  <svg viewBox="0 0 36 36" style={styles.svgPie}>
                    {stats.priorityData.map((p, i) => {
                      const total = stats.priorityData.reduce((acc, curr) => acc + curr.count, 0);
                      const percent = total === 0 ? 0 : (p.count / total) * 100;
                      const offset = stats.priorityData.slice(0, i).reduce((acc, curr) => acc + (total === 0 ? 0 : (curr.count / total) * 100), 0);
                      return (
                        <circle
                          key={i}
                          cx="18" cy="18" r="15.915"
                          fill="transparent"
                          stroke={p.fill}
                          strokeWidth="3.5"
                          strokeDasharray={`${percent} ${100 - percent}`}
                          strokeDashoffset={100 - offset + 25}
                        />
                      );
                    })}
                  </svg>
                  <div style={styles.donutCenter}>
                    <span style={styles.donutTotal}>{stats.total}</span>
                    <span style={styles.donutLabel}>Tasks</span>
                  </div>
               </div>
               <div style={styles.chartLegend}>
                 {stats.priorityData.map((p, i) => (
                   <div key={i} style={styles.legendItem}>
                     <div style={{...styles.legendDot, background: p.fill}} />
                     <span style={styles.legendText}>{p.name}: <b>{p.count}</b></span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {role === "admin" && (
          <div style={styles.tableCard}>
            <h3 style={styles.sectionTitle}><span>👥</span> Team Performance</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Member</th>
                  <th style={styles.th}>Completed (Weekly)</th>
                  <th style={styles.th}>Success Rate</th>
                  <th style={styles.th}>Total Assigned</th>
                </tr>
              </thead>
              <tbody>
                {stats.userPerformance.map((u, i) => (
                  <tr key={i} style={{
                    ...styles.tr,
                    ...(i < 3 ? {
                      background: i === 0 ? "rgba(142, 45, 226, 0.08)" : "rgba(142, 45, 226, 0.03)",
                      boxShadow: i === 0 ? "0 4px 15px rgba(142, 45, 226, 0.15)" : "none",
                      transform: i === 0 ? "scale(1.01)" : "none"
                    } : {})
                  }}>
                    <td style={styles.td}>
                      <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                        <span style={{fontSize: "20px"}}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ""}
                        </span>
                        <div style={{display: "flex", flexDirection: "column"}}>
                           <b style={{color: "var(--text-main)"}}>{u.name}</b>
                           {i < 3 && <span style={{...styles.bestBadge, fontSize: "9px", width: "fit-content"}}>{i === 0 ? "Champion" : "Elite Performance"}</span>}
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{fontWeight: "700", color: i < 3 ? "var(--primary)" : "inherit"}}>
                        {u.weeklyCompleted}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.tableRateBox}>
                        <div style={styles.miniBarTrack}>
                          <div style={{...styles.miniBarFill, width: `${u.rate}%`, background: u.rate > 80 ? "#10b981" : "#8e2de2"}} />
                        </div>
                        <span style={{fontWeight: i < 3 ? "800" : "600"}}>{u.rate}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>{u.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;