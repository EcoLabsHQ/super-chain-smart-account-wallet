import React from 'react'
import type { ResponseBadge } from '@/types/super-chain'

interface BadgeRenderStrategy {
  canRender: (badge: ResponseBadge) => boolean
  render?: (badge: ResponseBadge) => React.ReactNode
  renderDescription?: (badge: ResponseBadge) => React.ReactNode
  renderBadgeTiers?: (badge: ResponseBadge) => React.ReactNode
}

class DefaultBadgeStrategy implements BadgeRenderStrategy {
  canRender(badge: ResponseBadge): boolean {
    return true
  }

  render(badge: ResponseBadge): React.ReactNode {
    return null
  }

  renderDescription(badge: ResponseBadge): React.ReactNode {
    return null
  }

  renderBadgeTiers(badge: ResponseBadge): React.ReactNode {
    return null
  }
}

interface BadgeStrategyRendererProps {
  badge: ResponseBadge
  strategies: BadgeRenderStrategy[]
  defaultStrategy?: BadgeRenderStrategy
}

// Helper: devuelve la estrategia seleccionada para usar en distintas secciones
export const getBadgeStrategy = (
  badge: ResponseBadge,
  strategies: BadgeRenderStrategy[],
): BadgeRenderStrategy | undefined => {
  return strategies.find((s) => s.canRender(badge))
}

const BadgeStrategyRenderer: React.FC<BadgeStrategyRendererProps> = ({
  badge,
  strategies,
  defaultStrategy = new DefaultBadgeStrategy(),
}) => {
  const strategy = getBadgeStrategy(badge, strategies) ?? defaultStrategy
  // compatibilidad: si la estrategia provee `render` la usamos, si no, null
  return <>{strategy.render ? strategy.render(badge) : null}</>
}

export default BadgeStrategyRenderer
export type { BadgeRenderStrategy }
