import React from 'react';
import { Badge } from './ui/badge';
import { getCO2Level, formatCO2 } from '../lib/utils';

interface CO2IndicatorProps {
  co2Amount: number;
  className?: string;
}

export function CO2Indicator({ co2Amount, className }: CO2IndicatorProps) {
  const level = getCO2Level(co2Amount);
  
  const getVariant = () => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Badge variant={getVariant()} className={className}>
      {formatCO2(co2Amount)}
    </Badge>
  );
}
