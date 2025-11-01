'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedStatProps {
  label: string
  value: number
  suffix?: string
  gradient?: string
  delay?: number
}

export default function AnimatedStat({ 
  label, 
  value, 
  suffix = '', 
  gradient = 'from-blue-500 to-purple-500',
  delay = 0
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const duration = 1500
    const steps = 60
    const stepValue = value / steps
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        currentStep++
        const nextValue = Math.min(stepValue * currentStep, value)
        setDisplayValue(Math.floor(nextValue))

        if (currentStep >= steps) {
          clearInterval(interval)
          setDisplayValue(value)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timer)
  }, [isVisible, value, delay])

  return (
    <div ref={ref} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:scale-105">
      <div className={`text-3xl font-black mb-1 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {displayValue.toLocaleString('sv-SE')}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

