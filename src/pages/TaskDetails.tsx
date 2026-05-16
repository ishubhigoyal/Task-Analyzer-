import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  ArrowLeft, Clock, MessageSquare, Send, User, Calendar, Loader2, Save
} from "lucide-react";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`);
      return res.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["task", id] })
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => api.post(`/tasks/${id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      setComment("");
    }
  });

  if (isLoading) return <div className="p-10 text-white">Loading task...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-slate-500 hover:text-white transition-colors">
        <ArrowLeft size={18} />
        <span className="font-bold uppercase tracking-widest text-[10px]">Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div>
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 mb-4 ${
              task.priority === 'URGENT' ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-500'
            }`}>
              {task.priority} Priority
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">{task.title}</h1>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed">{task.description || "No description provided."}</p>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare size={20} className="mr-2 text-indigo-400" />
              Activity
            </h2>
            <div className="space-y-4">
              {task.comments?.map((c: any) => (
                <div key={c.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-xs text-white uppercase shrink-0">
                    {c.author.fullName.charAt(0)}
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-white uppercase">{c.author.fullName}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-slate-300">{c.content}</p>
                  </div>
                </div>
              ))}
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white uppercase shrink-0">
                  {user?.fullName.charAt(0)}
                </div>
                <div className="flex-1 relative">
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Write a comment..." 
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-indigo-500 transition-colors resize-none pr-12 h-24"
                  />
                  <button 
                    disabled={!comment.trim() || addCommentMutation.isPending}
                    onClick={() => addCommentMutation.mutate(comment)}
                    className="absolute bottom-4 right-4 p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Status</label>
              <select 
                value={task.status} 
                onChange={e => updateStatusMutation.mutate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 transition-all font-semibold"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="space-y-4">
               <div className="flex items-center space-x-3 text-slate-400">
                 <User size={16} />
                 <div>
                   <p className="text-[10px] uppercase font-bold text-slate-500">Assignee</p>
                   <p className="text-sm font-semibold text-white">{task.assignedTo?.fullName || "Unassigned"}</p>
                 </div>
               </div>
               <div className="flex items-center space-x-3 text-slate-400">
                 <Calendar size={16} />
                 <div>
                   <p className="text-[10px] uppercase font-bold text-slate-500">Due Date</p>
                   <p className="text-sm font-semibold text-white">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}</p>
                 </div>
               </div>
               <div className="flex items-center space-x-3 text-slate-400">
                 <Clock size={16} />
                 <div>
                   <p className="text-[10px] uppercase font-bold text-slate-500">Project</p>
                   <p className="text-sm font-semibold text-white">{task.project?.name}</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
