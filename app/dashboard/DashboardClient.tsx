'use client'

import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import AnimatedStat from '@/components/AnimatedStats'

interface ProjectType {
  id: string
  name: string
  budget: number
  hours: number
}

interface DashboardClientProps {
  userEmail?: string | null
  stats: {
    totalHours: number
    activeProjects: number
    invoicesToSend: number
  }
  projects: ProjectType[]
}

export default function DashboardClient({ userEmail, stats, projects }: DashboardClientProps) {
  const router = useRouter()

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'from-red-500 to-red-600'
    if (percentage >= 70) return 'from-orange-500 to-orange-600'
    return 'from-blue-500 via-purple-500 to-pink-500'
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      
      {/* Main content */}
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-500">Välkommen tillbaka, {userEmail?.split('@')[0] || 'Användare'}!</p>
            </div>
            <button
              onClick={() => router.push('/reports/new')}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              aria-label="Rapportera tid"
            >
              ⏱️ Rapportera tid
            </button>
          </div>

          {/* Stats Cards with Animation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <AnimatedStat 
              label="Timmar denna vecka" 
              value={stats.totalHours} 
              suffix="h"
              gradient="from-blue-500 to-blue-600"
              delay={0}
            />
            <AnimatedStat 
              label="Aktiva projekt" 
              value={stats.activeProjects}
              gradient="from-purple-500 to-purple-600"
              delay={200}
            />
            <AnimatedStat 
              label="Fakturor att skicka" 
              value={stats.invoicesToSend}
              gradient="from-pink-500 to-pink-600"
              delay={400}
            />
          </div>

          {/* New Project Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 backdrop-blur-sm bg-opacity-90">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Project name"
                  readOnly
                  onClick={() => router.push('/projects/new')}
                  aria-label="Project name - click to create new project"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Client</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Client name"
                  readOnly
                  onClick={() => router.push('/projects/new')}
                  aria-label="Client name - click to create new project"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  readOnly
                  onClick={() => router.push('/projects/new')}
                  aria-label="Due date - click to create new project"
                />
              </div>
            </div>
            <button
              onClick={() => router.push('/projects/new')}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              aria-label="Create new project"
            >
              Create
            </button>
          </div>

          {/* Projects Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
            {projects.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center text-gray-500">
                <p className="text-lg mb-4">Inga projekt hittades</p>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold py-2 px-6 rounded-xl"
                  aria-label="Skapa första projektet"
                >
                  Skapa första projektet
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {projects.slice(0, 3).map((proj) => {
                    const percentage = proj.budget > 0 ? Math.round((proj.hours / proj.budget) * 100) : 0
                    return (
                      <div
                        key={proj.id}
                        onClick={() => router.push(`/projects/${proj.id}`)}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 backdrop-blur-sm bg-opacity-90"
                        role="button"
                        tabIndex={0}
                        aria-label={`Project ${proj.name} - ${percentage}% complete`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            router.push(`/projects/${proj.id}`)
                          }
                        }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{proj.name}</h3>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{proj.hours}h / {proj.budget}h</span>
                            <span className="font-bold">{percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                            <div
                              className={`h-full bg-gradient-to-r ${getProgressColor(percentage)} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {projects.length > 3 && (
                  <button
                    onClick={() => router.push('/projects')}
                    className="mt-6 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                    aria-label="Visa alla projekt"
                  >
                    View all projects →
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

