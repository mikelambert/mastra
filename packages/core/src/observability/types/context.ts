// packages/core/src/observability/types/context.ts

import type { LoggerContext } from './logging';
import type { MetricsContext } from './metrics';
import type { TracingContext } from './tracing';

// ============================================================================
// ObservabilityContextMixin
// ============================================================================

/**
 * Mixin interface that provides unified observability access.
 * All execution contexts (tools, workflow steps, processors) extend this
 * to gain access to tracing, logging, and metrics.
 */
export interface ObservabilityContextMixin {
  /** Tracing context for span operations */
  tracing: TracingContext;

  /** Logger for structured logging with trace correlation */
  logger: LoggerContext;

  /** Metrics for counters, gauges, histograms */
  metrics: MetricsContext;

  /**
   * @deprecated Use `tracing` instead. Will be removed in v2.0.
   */
  tracingContext: TracingContext;
}
