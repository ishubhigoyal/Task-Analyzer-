import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { 
  Plus, Users, CheckSquare, UserPlus, Loader2, Calendar, Layout
} from "lucide-react";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data.data;
    }
  });

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data.data;
    },
    enabled: isMemberModalOpen
  });

  const addMemberMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/projects/${id}/members`, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setIsMemberModalOpen(false);
    }
  });

  if (isLoading) return <div className="p-10 text-slate-400 font-medium tracking-tight">Syncing architectural project space...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Link to="/projects" className="hover:underline">Projects</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400">Project Workspace</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-4">{project.name}</h1>
          <p className="text-slate-500 font-medium leading-relaxed">{project.description || "Collective workspace for high-precision project execution and team orchestration."}</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-3 shrink-0">
            <button 
              onClick={() => setIsMemberModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 rounded-2xl font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <UserPlus size={18} />
              <span>Add Member</span>
            </button>
            <button 
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <Plus size={18} />
              <span>Assign Objective</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 flex items-center tracking-tight">
                <CheckSquare size={20} className="mr-3 text-indigo-600" />
                Project Objectives
              </h2>
              <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full">{project.tasks?.length || 0} Total</span>
            </div>
            
            <div className="space-y-3 flex-1">
              {project.tasks?.map((task: any) => (
                <Link key={task.id} to={`/tasks/${task.id}`}>
                  <div className="p-5 bg-white border border-slate-50 rounded-2xl hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all flex justify-between items-center group relative overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-1.5 h-1.5 rounded-full ${task.status === 'DONE' ? 'bg-emerald-500' : task.status === 'IN_PROGRESS' ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors leading-tight mb-0.5">{task.title}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{task.priority} Priority</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{task.status.replace('_', ' ')}</span>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <Calendar size={14} />
                      </div>
                    </div>
                    {/* Background accent on hover */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-[40px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
              {(!project.tasks || project.tasks.length === 0) && (
                <div className="flex flex-col items-center justify-center py-16 opacity-30">
                  <Layout size={48} className="text-slate-400 mb-4" />
                  <p className="font-bold text-slate-400">Initial state: No objectives recorded.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center tracking-tight">
              <Users size={20} className="mr-3 text-emerald-500" />
              Active Team
            </h2>
            <div className="space-y-5">
              {project.members?.map((m: any) => (
                <div key={m.id} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-slate-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-black text-slate-400 shadow-sm transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105">
                    {m.user.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-none mb-1">{m.user.fullName}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{m.user.role}</p>
                  </div>
                </div>
              ))}
              {(!project.members || project.members.length === 0) && <p className="text-slate-400 text-xs font-medium">No team members assigned.</p>}
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[32px] shadow-xl shadow-indigo-100">
             <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-2">Workspace Health</p>
             <h4 className="text-white font-bold mb-4">Velocity target achieved?</h4>
             <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4 rounded-full"></div>
             </div>
             <p className="mt-3 text-indigo-100 text-[10px] font-bold">75% PROJECT COMPLETION</p>
          </div>
        </div>
      </div>

      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white border border-slate-100 w-full max-w-md rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Expand Team.</h2>
            <p className="text-slate-500 mb-8 font-medium">Select a specialist to assign to this workspace.</p>
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {allUsers?.map((u: any) => (
                <button 
                  key={u.id}
                  onClick={() => addMemberMutation.mutate(u.id)}
                  disabled={project.members.some((m:any) => m.userId === u.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all font-bold text-sm text-slate-800 disabled:opacity-30 group"
                >
                  <span>{u.fullName}</span>
                  <UserPlus size={16} className="text-indigo-400 group-hover:text-indigo-600" />
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsMemberModalOpen(false)} 
              className="w-full mt-8 py-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 transition-colors"
            >
              Abort Selection
            </button>
          </div>
        </div>
      )}

      {isTaskModalOpen && (
        <CreateTaskModal 
          projectId={id!}
          members={project.members}
          onClose={() => setIsTaskModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["project", id] });
            setIsTaskModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function CreateTaskModal({ projectId, members, onClose, onSuccess }: any) {
  const [data, setData] = useState({ title: "", description: "", priority: "MEDIUM", assignedTo: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/tasks", { ...data, projectId });
      onSuccess();
    } catch { alert("Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Define Objective.</h2>
        <p className="text-slate-500 mb-8 font-medium">Record a new task for the project workspace.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Objective Title</label>
            <input required placeholder="e.g. Deploy API to Staging" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contextual Details</label>
            <textarea placeholder="Specify requirements..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none h-24 shadow-inner" value={data.description} onChange={e => setData({...data, description: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Assignee</label>
            <select className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl text-slate-900 font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all appearance-none" value={data.assignedTo} onChange={e => setData({...data, assignedTo: e.target.value})}>
              <option value="">Unassigned Reserve</option>
              {members.map((m: any) => <option key={m.userId} value={m.userId}>{m.user.fullName}</option>)}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 text-slate-400 font-bold text-sm uppercase tracking-widest">Abort</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Record Objective</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
