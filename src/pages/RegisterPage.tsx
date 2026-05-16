import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckSquare, Loader2, AlertCircle } from "lucide-react";
import api from "../api/api";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string(),
  role: z.enum(["ADMIN", "MEMBER"])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "MEMBER" }
  });

  const onSubmit = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/auth/register", data);
      navigate("/login", { state: { message: "Account created! Please sign in." } });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12 selection:bg-indigo-100">
      <div className="w-full max-w-xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[120px] pointer-events-none" />

        <Link to="/" className="flex items-center justify-center gap-3 mb-10 relative group">
          <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
            <div className="h-5 w-5 border-2 border-white rounded-sm"></div>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">TeamTask</span>
        </Link>
        
        <div className="bg-white border border-slate-100 p-8 md:p-12 rounded-[32px] shadow-xl shadow-slate-200/50 relative">
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Create workspace.</h2>
          <p className="text-slate-500 mb-10 font-medium leading-relaxed">Modernize your workflow with architectural task management.</p>
          
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 text-rose-500 text-sm font-bold">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Identity</label>
                <input 
                  {...register("fullName")}
                  className={`w-full bg-slate-50 border ${errors.fullName ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500 focus:bg-white'} rounded-2xl px-5 py-3.5 text-slate-900 outline-none transition-all font-medium`}
                  placeholder="Alex Rivera"
                />
                {errors.fullName && <span className="text-[10px] font-black text-rose-500 ml-1 uppercase">{errors.fullName.message}</span>}
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Role</label>
                <select 
                  {...register("role")}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-2xl px-5 py-3.5 text-slate-900 outline-none transition-all font-medium appearance-none"
                >
                  <option value="MEMBER">Team Member</option>
                  <option value="ADMIN">Project Admin</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email Address</label>
              <input 
                {...register("email")}
                type="email" 
                className={`w-full bg-slate-50 border ${errors.email ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500 focus:bg-white'} rounded-2xl px-5 py-3.5 text-slate-900 outline-none transition-all font-medium`}
                placeholder="you@company.com"
              />
              {errors.email && <span className="text-[10px] font-black text-rose-500 ml-1 uppercase">{errors.email.message}</span>}
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Authorization Pwd</label>
                    <input 
                      {...register("password")}
                      type="password" 
                      className={`w-full bg-slate-50 border ${errors.password ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500 focus:bg-white'} rounded-2xl px-5 py-3.5 text-slate-900 outline-none transition-all font-medium`}
                      placeholder="••••••••"
                    />
                    {errors.password && <span className="text-[10px] font-black text-rose-500 ml-1 uppercase">{errors.password.message}</span>}
                </div>
                <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Identity</label>
                    <input 
                      {...register("confirmPassword")}
                      type="password" 
                      className={`w-full bg-slate-50 border ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-200 focus:border-indigo-500 focus:bg-white'} rounded-2xl px-5 py-3.5 text-slate-900 outline-none transition-all font-medium`}
                      placeholder="••••••••"
                    />
                    {errors.confirmPassword && <span className="text-[10px] font-black text-rose-500 ml-1 uppercase">{errors.confirmPassword.message}</span>}
                </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 shadow-xl shadow-indigo-100 active:scale-[0.98]"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <span>Construct Account</span>}
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <span className="text-slate-400 text-sm font-medium">Already have a workspace? </span>
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm underline underline-offset-4 decoration-2 transition-all">Enter Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
