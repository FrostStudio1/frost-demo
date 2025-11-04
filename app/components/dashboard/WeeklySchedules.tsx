// app/components/dashboard/WeeklySchedules.tsx
"use client";

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/context/TenantContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useSchedules } from '@/hooks/useSchedules';
import { useProjects } from '@/hooks/useProjects';
import { useEmployees } from '@/hooks/useEmployees';
import type { ScheduleSlot } from '@/types/scheduling';
import { Calendar, Clock, Briefcase, User, Sparkles } from 'lucide-react';

export function WeeklySchedules() {
  const { tenantId } = useTenant();
  const { isAdmin, employeeId } = useAdmin();

  // Hämta veckans scheman
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const startDate = monday.toISOString().split('T')[0];
  const endDate = sunday.toISOString().split('T')[0];

  const { data: schedules, isLoading } = useSchedules({
    start_date: startDate,
    end_date: endDate,
    ...(isAdmin ? {} : { employee_id: employeeId || '' }),
  });

  const { data: projects } = useProjects();
  const { data: employees } = useEmployees();

  // Gruppera scheman per dag
  const schedulesByDay = useMemo(() => {
    if (!schedules) return {};
    
    const grouped: Record<string, ScheduleSlot[]> = {};
    schedules.forEach(schedule => {
      const date = new Date(schedule.start_time).toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(schedule);
    });
    
    return grouped;
  }, [schedules]);

  // Hämta projektnamn och anställdnamn
  const getProjectName = (projectId: string) => {
    return projects?.find(p => p.id === projectId)?.name || 'Okänt projekt';
  };

  const getEmployeeName = (employeeId: string) => {
    return employees?.find(e => e.id === employeeId)?.full_name || employees?.find(e => e.id === employeeId)?.name || 'Okänd';
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const totalSchedules = schedules?.length || 0;
  const totalHours = schedules?.reduce((sum, s) => {
    const start = new Date(s.start_time);
    const end = new Date(s.end_time);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return sum + hours;
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border-4 border-purple-400/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Pass denna veckan</h2>
          </div>
          <p className="text-white/80 text-sm">Laddar...</p>
        </div>
      </div>
    );
  }

  if (totalSchedules === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border-4 border-purple-400/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-white" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Pass denna veckan</h2>
          </div>
          <p className="text-white/80 text-sm">Inga schemalagda pass denna vecka</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border-4 border-purple-400/50 backdrop-blur-sm relative overflow-hidden mb-6 sm:mb-8">
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Pass denna veckan</h2>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-white">{totalSchedules}</div>
            <div className="text-xs sm:text-sm text-white/80">pass</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-xs text-white/80">Totalt timmar</span>
            </div>
            <div className="text-2xl font-black text-white">{totalHours.toFixed(1)}h</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-white" />
              <span className="text-xs text-white/80">Projekt</span>
            </div>
            <div className="text-2xl font-black text-white">
              {new Set(schedules?.map(s => s.project_id)).size}
            </div>
          </div>
        </div>

        {/* Schedule list */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {Object.entries(schedulesByDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, daySchedules]) => (
              <div key={date} className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">{formatDate(date)}</span>
                  <span className="text-xs text-white/70">({daySchedules.length} pass)</span>
                </div>
                <div className="space-y-2">
                  {daySchedules.map(schedule => (
                    <div key={schedule.id} className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-3 h-3 text-white" />
                            <span className="text-sm font-semibold text-white">
                              {getProjectName(schedule.project_id)}
                            </span>
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3 h-3 text-white/80" />
                              <span className="text-xs text-white/80">
                                {getEmployeeName(schedule.employee_id)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-white/80" />
                            <span className="text-xs text-white/80">
                              {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                            </span>
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-white/30 rounded text-xs font-semibold text-white">
                          {schedule.status === 'scheduled' ? 'Schemalagd' :
                           schedule.status === 'confirmed' ? 'Bekräftad' :
                           schedule.status === 'completed' ? 'Slutförd' : 'Avbokad'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
