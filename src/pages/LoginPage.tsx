import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import api from "../api/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth, setAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent, guestEmail?: string, guestPassword?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    const loginEmail = guestEmail || email;
    const loginPassword = guestPassword || password;

    try {
      const response = await api.post("/auth/login", { email: loginEmail, password: loginPassword });
      const { user, accessToken } = response.data.data;
      
      // Store auth state
      setAuth(user, accessToken);
      setAuthenticated(true);
      
      // Immediate navigation
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    handleLogin(null as any, "guest@example.com", "password123");
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
...
        <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-xl shadow-slate-200/50 relative">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">Sign in to orchestrate your team projects.</p>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-3 text-rose-500 text-sm font-bold">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-12 pr-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-300 font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl pl-12 pr-4 py-3.5 text-slate-900 outline-none transition-all placeholder:text-slate-300 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>Sign In to Dashboard</span>}
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-slate-400">Easy Access</span></div>
            </div>

            <button 
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold transition-all border border-slate-200 flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              <span>Login as Guest</span>
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm font-medium">
            New to TeamTask? <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold underline underline-offset-4 decoration-2">Create Free Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
