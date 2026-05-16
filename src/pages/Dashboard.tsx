import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from "recharts";
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  Clock, 
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Dashboard() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";

  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", user?.role],
    queryFn: async () => {
      try {
        const endpoint = isAdmin ? "/dashboard/admin" : "/dashboard/member";
        const res = await api.get(endpoint);
        return res.data.data;
      } catch (err: any) {
        console.error("Dashboard data fetch failed:", err);
        throw err;
      }
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-2xl border border-slate-700"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800 rounded-2xl border border-slate-700"></div>
          <div className="h-80 bg-slate-800 rounded-2xl border border-slate-700"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Unavailable</h2>
        <p className="text-slate-500 mt-2 text-center max-w-xs font-medium">
          {error instanceof Error ? error.message : "We encountered an architectural error while retrieving your workspace stats."}
        </p>
        <button 
          onClick={() => refetch()}
          className="mt-8 bg-indigo-600 hover:bg-slate-900 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { stats = {}, tasksByStatus = [], overdueTasks = [], tasks = [] } = dashboardData;

  const statusData = tasksByStatus?.map((s: any) => ({
    name: s.status,
    value: s._count
  })) || [];

  return (
    <div className="space-y-8">
      {/* Welcome Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of current activities across your projects.</p>
        </div>
        <Link 
          to="/projects" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
        >
          View All Projects
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isAdmin ? (
          <>
            <StatCard label="Active Projects" value={stats.projectsCount} icon={<Briefcase size={20} />} trend="+2 this month" />
            <StatCard label="Team Members" value={stats.membersCount} icon={<Users size={20} />} />
            <StatCard label="Total Tasks" value={stats.tasksCount} icon={<CheckSquare size={20} />} trend="92% completion" />
            <StatCard label="Overdue Tasks" value={stats.overdueCount} icon={<AlertTriangle size={20} />} trend="ACTION REQ" isUrgent />
          </>
        ) : (
          <>
            <StatCard label="My Tasks" value={stats.total} icon={<CheckSquare size={20} />} trend={`${stats.completed} done`} />
            <StatCard label="Completed" value={stats.completed} icon={<CheckSquare size={20} />} isSuccess />
            <StatCard label="In Progress" value={stats.inProgress} icon={<Clock size={20} />} />
            <StatCard label="Overdue" value={stats.overdue} icon={<AlertTriangle size={20} />} isUrgent />
          </>
        )}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-12 gap-6 min-h-[400px]">
        {/* Status Distribution */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <h3 className="font-bold text-slate-800">Task Velocity</h3>
            <div className="flex gap-2">
               <span className="w-3 h-3 bg-indigo-600 rounded-sm"></span>
               <span className="text-[10px] font-bold text-slate-400 uppercase">Velocity</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={isAdmin ? statusData : [
                 { name: 'To Do', value: tasks.filter((t:any) => t.status === 'TODO').length },
                 { name: 'In Progress', value: stats.inProgress },
                 { name: 'Review', value: tasks.filter((t:any) => t.status === 'REVIEW').length },
                 { name: 'Done', value: stats.completed },
               ]}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dy={10} fontWeight="bold" />
                 <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} dx={-10} fontWeight="bold" />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Priority / Recent Feed */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
             <h3 className="font-bold text-slate-800">{isAdmin ? "Admin Overview" : "Priority Tasks"}</h3>
             <Link to="/tasks" className="text-[10px] text-indigo-600 font-black uppercase hover:underline tracking-widest">
               View All
             </Link>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              {isAdmin ? (
                 overdueTasks?.length > 0 ? overdueTasks.slice(0, 6).map((task: any) => (
                  <TaskItem key={task.id} task={task} />
                )) : <EmptyState message="No critical issues found." />
              ) : (
                 tasks?.length > 0 ? tasks.slice(0, 6).map((task: any) => (
                  <TaskItem key={task.id} task={task} />
                )) : <EmptyState message="No tasks assigned yet." />
              )}
            </div>
            
            {!isAdmin && (
              <div className="mt-6 pt-6 border-t border-slate-50">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Capacity Utilization</p>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-500 w-[78%] rounded-full shadow-sm"></div>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-tight">78% UTILIZED</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, isUrgent, isSuccess }: any) {
  return (
    <div className={`bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md ${isUrgent ? 'border-rose-200 ring-1 ring-rose-500/5' : 'border-slate-100'}`}>
      <div className="flex justify-between items-start mb-2">
        <p className={`text-sm font-semibold ${isUrgent ? 'text-rose-500' : isSuccess ? 'text-emerald-500' : 'text-slate-500'}`}>{label}</p>
        <div className={`p-2 rounded-xl ${isUrgent ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'}`}>
          {icon}
        </div>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className={`text-4xl font-bold tracking-tight ${isUrgent ? 'text-rose-600' : 'text-slate-900'}`}>{value}</span>
        {trend && (
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isUrgent ? 'bg-rose-100 text-rose-600' : 'text-emerald-500'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function TaskItem({ task }: any) {
  const statusColors: any = {
    'DONE': 'bg-emerald-100 text-emerald-600',
    'IN_PROGRESS': 'bg-indigo-100 text-indigo-600',
    'TODO': 'bg-slate-100 text-slate-400',
    'REVIEW': 'bg-amber-100 text-amber-600'
  };

  return (
    <Link to={`/tasks/${task.id}`}>
      <div className="group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 cursor-default">
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{task.title}</span>
          <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider mt-0.5">{task.project?.name || "Unassigned"}</p>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shrink-0 ml-4 ${statusColors[task.status] || 'bg-slate-100 text-slate-500'}`}>
          {task.status.replace('_', ' ')}
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 opacity-50">
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}
