import { useQuery } from "@tanstack/react-query";
import { Users, Mail, Shield, User as UserIcon } from "lucide-react";
import api from "../api/api";

export default function MembersList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data.data;
    }
  });

  if (isLoading) return <div className="text-slate-400 p-10 font-medium">Scanning team index...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Roster</h1>
        <p className="text-slate-500 mt-1">Full index of architectural collaborators across the workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((member: any) => (
          <div key={member.id} className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-600 border border-slate-100 shadow-inner">
                <UserIcon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{member.fullName}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-400'}`}>
                  {member.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-xs text-slate-400 font-medium">
                <Mail size={14} className="mr-3 text-slate-300" />
                {member.email}
              </div>
              <div className="flex items-center text-xs text-slate-400 font-medium">
                <Shield size={14} className="mr-3 text-slate-300" />
                Authorized Access
              </div>
            </div>

            <button className="w-full mt-8 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
