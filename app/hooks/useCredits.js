// app/hooks/useCredits.js
// Hook pour afficher et gérer les crédits utilisateur

'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useCredits() {
  const [credits, setCredits] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const fetchCredits = useCallback(async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setCredits(null)
        return
      }

      const { data, error } = await supabase
        .from('user_credits')
        .select('credits_balance, credits_used, credits_limit, plan, reset_at')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setCredits(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  // Vérifie si l'user a assez de crédits pour une durée donnée
  const canGenerate = useCallback((duration_seconds = 60) => {
    if (!credits) return false
    const needed = Math.ceil((duration_seconds / 60) * 1000)
    return credits.credits_balance >= needed
  }, [credits])

  // Calcule les crédits nécessaires pour une durée
  const creditsNeeded = useCallback((duration_seconds = 60) => {
    return Math.ceil((duration_seconds / 60) * 1000)
  }, [])

  // Pourcentage utilisé
  const usagePercent = credits
    ? Math.round((credits.credits_used / credits.credits_limit) * 100)
    : 0

  return {
    credits,
    loading,
    error,
    canGenerate,
    creditsNeeded,
    usagePercent,
    refetch: fetchCredits,
  }
}