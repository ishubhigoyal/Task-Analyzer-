import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { User, Shield, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "../api/api";

export default function LoginPage() {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth, setAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { fullName: fullName.trim(), role });
      const { user, accessToken } = response.data.data;
      
      // Store auth state
      setAuth(user, accessToken);
      setAuthenticated(true);
      
      // Immediate navigation
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 selection:bg-indigo-100 selection:text-indigo-700">
      <div className="w-full max-w-md relative">
        {/* Soft Background Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />

        <Link to="/" className="flex items-center justify-center gap-3 mb-12 relative group">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <div className="h-5 w-5 border-2 border-white rounded-sm"></div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">TeamTask</span>
        </Link>

        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-xl shadow-slate-200/50 relative">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Instant Login</h2>
          <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">No password required. Just tell us who you are.</p>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-500 text-sm font-bold">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-12 pr-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-300 font-medium"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Your Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setRole("MEMBER")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === "MEMBER" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                >
                  <User size={24} className={role === "MEMBER" ? "text-indigo-600" : "text-slate-300"} />
                  <span className="text-xs font-bold mt-2 tracking-tight">Member</span>
                  {role === "MEMBER" && <CheckCircle2 size={14} className="absolute top-2 right-2 text-indigo-600" />}
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${role === "ADMIN" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200"}`}
                >
                  <Shield size={24} className={role === "ADMIN" ? "text-indigo-600" : "text-slate-300"} />
                  <span className="text-xs font-bold mt-2 tracking-tight">Admin</span>
                  {role === "ADMIN" && <CheckCircle2 size={14} className="absolute top-2 right-2 text-indigo-600" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>Access Dashboard</span>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-xs font-medium px-4">
            By continuing, you agree to our workspace policies and terms.
          </p>
        </div>
      </div>
    </div>
  );
}
