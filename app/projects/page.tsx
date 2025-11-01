import { Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import ProjectsContent from './ProjectsContent'

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <main className="flex-1 lg:ml-0 overflow-x-hidden">
        <Suspense fallback={
          <div className="p-10 flex items-center justify-center">
            <div className="text-gray-500">Laddar...</div>
          </div>
        }>
          <ProjectsContent />
        </Suspense>
      </main>
    </div>
  )
}
