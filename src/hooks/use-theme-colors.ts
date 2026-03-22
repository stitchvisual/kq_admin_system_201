"use client"

import { useTheme } from "next-themes"
import { useMemo } from "react"
import { colors, darkColors, shadows, darkShadows, skeleton, darkSkeleton, appointmentStatus, darkAppointmentStatus, invoiceStatus, darkInvoiceStatus } from "@/styles/botanical"

export function useThemeColors() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return useMemo(() => ({
    colors: isDark ? darkColors : colors,
    shadows: isDark ? darkShadows : shadows,
    skeleton: isDark ? darkSkeleton : skeleton,
    appointmentStatus: isDark ? darkAppointmentStatus : appointmentStatus,
    invoiceStatus: isDark ? darkInvoiceStatus : invoiceStatus,
    isDark,
  }), [isDark])
}
