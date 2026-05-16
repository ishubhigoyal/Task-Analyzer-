import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { 
  User, Mail, Shield, Camera, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || ""
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => api.patch("/users/profile", data),
    onSuccess: (res) => {
      setUser(res.data.data);
      setStatus({ type: 'success', message: "Profile updated successfully!" });
      setTimeout(() => setStatus(null), 3000);
    },
    onError: () => {
      setStatus({ type: 'error', message: "Failed to update profile." });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-slate-400 mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="h-32 bg-indigo-600 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-slate-900 rounded-full">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-slate-900">
              {user?.fullName.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-16 p-8">
          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-bold">{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-12 pr-4 py-3 text-white outline-none transition-all"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    disabled
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-500 outline-none cursor-not-allowed"
                    value={formData.email}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Role</label>
              <div className="flex items-center space-x-3 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl">
                <Shield className="text-indigo-400" size={18} />
                <span className="text-white font-bold text-sm tracking-widest uppercase">{user?.role}</span>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full md:w-auto px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2"
              >
                {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <span>Save Changes</span>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
