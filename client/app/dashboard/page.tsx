import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-app-dark-blue via-app-blue to-app-blue p-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-app-dark-blue">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {session.user.name || session.user.email}!</p>
          </div>
          <form action="/api/auth/sign-out" method="POST">
            <button
              type="submit"
              className="bg-app-red hover:bg-app-red/80 text-white font-bold py-2 px-6 rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-app-red"
            >
              Sign Out
            </button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-app-blue/10 border border-app-blue/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-app-dark-blue mb-2">Quick Actions</h2>
            <p className="text-gray-600">Access your most used features</p>
          </div>
          
          <div className="bg-app-green/10 border border-app-green/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-app-dark-blue mb-2">Recent Activity</h2>
            <p className="text-gray-600">View your latest timekeeping entries</p>
          </div>
          
          <div className="bg-app-orange/10 border border-app-orange/20 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-app-dark-blue mb-2">Reports</h2>
            <p className="text-gray-600">Generate payroll reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}
