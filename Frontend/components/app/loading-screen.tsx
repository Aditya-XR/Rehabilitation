"use client"

import { Leaf } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({
  message = "Restoring your session...",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-2xl text-foreground tracking-wide">Serenity Center</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Spinner className="text-primary" />
      </div>
    </div>
  )
}
