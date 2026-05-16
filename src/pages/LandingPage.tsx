import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Users, 
  Zap, 
  BarChart3, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-700 font-sans">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <CheckCircle2 className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight uppercase">TeamTask</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/login" className="text-sm font-bold uppercase text-slate-400 hover:text-indigo-600 transition-colors tracking-widest">Login</Link>
            <Link to="/login" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-24 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
              <Zap size={14} className="text-indigo-600" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Enterprise Ready</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-950 leading-[0.9] tracking-tighter mb-8">
              ORCHESTRATE YOUR <span className="text-indigo-600">TEAM'S SUCCESS.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-xl font-medium leading-relaxed">
              Modern task management designed for high-performance teams that value speed, precision, and architectural elegance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-100 flex items-center justify-center">
                Start Building Free
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link to="/login" className="px-8 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl font-bold text-lg transition-all border border-slate-200 flex items-center justify-center">
                Live Demo
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50 pointer-events-none" />
      </section>

      <section className="py-24 bg-slate-50/50 border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard icon={<Users />} title="Collaboration" description="Real-time sync and seamless team delegation built for scaling teams." />
          <FeatureCard icon={<BarChart3 />} title="Analytics" description="Powerful insights to help you track progress and predict completion dates." />
          <FeatureCard icon={<ShieldCheck />} title="Security" description="Enterprise-grade protection for your most sensitive organizational data." />
        </div>
      </section>

      <footer className="py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="text-white" size={16} />
            </div>
            <span className="font-bold text-slate-900 tracking-tight uppercase">TeamTask</span>
          </div>
          <p className="text-slate-400 text-xs font-medium">© 2024 TeamTask Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="group p-10 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
      <div className="w-14 h-14 bg-slate-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
    </div>
  );
}
