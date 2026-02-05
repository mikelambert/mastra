// packages/core/src/observability/no-op/context.ts

import type { LoggerContext } from '../types/logging';
import type { MetricsContext, Counter, Gauge, Histogram } from '../types/metrics';

// ============================================================================
// No-Op Metric Instruments
// ============================================================================

const noOpCounter: Counter = {
  add() {},
};

const noOpGauge: Gauge = {
  set() {},
};

const noOpHistogram: Histogram = {
  record() {},
};

// ============================================================================
// No-Op LoggerContext
// ============================================================================

/**
 * No-op logger context that silently discards all log calls.
 * Used when observability is not configured.
 */
export const noOpLoggerContext: LoggerContext = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

// ============================================================================
// No-Op MetricsContext
// ============================================================================

/**
 * No-op metrics context that silently discards all metric operations.
 * Used when observability is not configured.
 */
export const noOpMetricsContext: MetricsContext = {
  counter() {
    return noOpCounter;
  },
  gauge() {
    return noOpGauge;
  },
  histogram() {
    return noOpHistogram;
  },
};
