import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { 
  CheckSquare, Filter, Search, Calendar, ChevronRight, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

export default function TasksList() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/tasks");
      return res.data.data;
    }
  });

  const filteredTasks = tasks?.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "ALL" || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) return <div className="text-slate-400 p-10 font-medium">Loading tasks from headquarters...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Personal Task Buffer</h1>
          <p className="text-slate-500 mt-1">Manage and execute your personal task queue.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          <Search size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            placeholder="Search within buffer..." 
            className="w-full bg-white border border-slate-100 rounded-full pl-11 pr-4 py-3.5 text-sm text-slate-900 outline-none transition-all shadow-sm focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-sm flex shrink-0">
          {["ALL", "TODO", "IN_PROGRESS", "DONE"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Objective</th>
                <th className="px-8 py-5">Architectural Space</th>
                <th className="px-8 py-5">Current Status</th>
                <th className="px-8 py-5">Priority</th>
                <th className="px-8 py-5">Timeline</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks?.length > 0 ? (
                filteredTasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <Link to={`/tasks/${task.id}`} className="block">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                      </Link>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{task.project?.name || 'Isolated'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                        task.status === 'DONE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        task.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        task.priority === 'URGENT' ? 'text-rose-500' :
                        task.priority === 'HIGH' ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                        <Calendar size={12} className="mr-2 text-indigo-500/50" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link to={`/tasks/${task.id}`} className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 hover:bg-slate-900 hover:text-white flex items-center justify-center transition-all ml-auto group-hover:scale-110">
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                        <CheckSquare size={24} />
                      </div>
                      <p className="text-slate-400 text-sm font-medium">Task buffer is currently empty.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
