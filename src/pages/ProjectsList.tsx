import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Briefcase, 
  Calendar, 
  Users, 
  CheckSquare,
  Loader2,
  ExternalLink,
  Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

export default function ProjectsList() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  const filteredProjects = projects?.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-800 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of current activities across {projects?.length || 0} projects.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Create New Project</span>
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            className="w-full bg-white border border-slate-100 rounded-full pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects?.length > 0 ? (
          filteredProjects.map((project: any) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              isAdmin={isAdmin} 
              onDelete={() => {
                if(window.confirm("Delete this project?")) deleteMutation.mutate(project.id);
              }}
            />
          ))
        ) : (
          <div className="col-span-full py-20 bg-white border border-slate-100 border-dashed rounded-[32px] flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-300">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-500 max-w-xs font-medium">
              {searchTerm ? "Try adjusting your search criteria." : "Create your first project to get started with your team."}
            </p>
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

function ProjectCard({ project, isAdmin, onDelete }: any) {
  return (
    <div className="group bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full relative">
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div className="p-2.5 bg-slate-50 text-indigo-600 rounded-2xl border border-slate-100 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Briefcase size={22} />
        </div>
        <div className="flex items-center space-x-1">
          {isAdmin && (
            <button 
              onClick={onDelete}
              className="p-2 text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50"
            >
              <Trash2 size={18} />
            </button>
          )}
          <Link 
            to={`/projects/${project.id}`}
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-xl hover:bg-indigo-50"
          >
            <ExternalLink size={18} />
          </Link>
        </div>
      </div>

      <Link to={`/projects/${project.id}`} className="flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1">{project.name}</h3>
        <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 leading-relaxed min-h-[40px]">
          {project.description || "Architectural project space for deep-focus team collaboration."}
        </p>
      </Link>

      <div className="flex items-center gap-6 pt-6 border-t border-slate-50 mt-auto">
        <div className="flex items-center gap-2 text-slate-400">
          <CheckSquare size={14} className="text-indigo-600" />
          <span className="text-[10px] font-black uppercase tracking-widest">{project._count?.tasks || 0} Tasks</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">{project._count?.members || 0} Team</span>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({ isOpen, onClose, onSuccess }: any) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/projects", { name, description });
      onSuccess();
      setName("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert("Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-100 w-full max-w-lg rounded-[32px] p-10 shadow-2xl animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Create New Project</h2>
        <p className="text-slate-500 mb-8 font-medium">Define the parameters for your new architectural workspace.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Project Name</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-3.5 text-slate-900 outline-none transition-all font-medium"
              placeholder="e.g. Q4 Growth Sprint"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brief Description</label>
            <textarea 
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-3.5 text-slate-900 outline-none transition-all font-medium resize-none shadow-inner"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold transition-all text-sm uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <span>Launch Project</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
