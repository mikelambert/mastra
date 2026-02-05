// packages/core/src/observability/types/bus.ts

import type { FeedbackEvent } from './feedback';
import type { LogEvent } from './logging';
import type { MetricEvent } from './metrics';
import type { ScoreEvent } from './scores';
import type { TracingEvent } from './tracing';

// ============================================================================
// ObservabilityEventBus Interface
// ============================================================================

/**
 * Generic event bus interface for observability events.
 * Implementations handle buffering, batching, and delivery to exporters.
 */
export interface ObservabilityEventBus<TEvent> {
  /** Emit an event to the bus */
  emit(event: TEvent): void;

  /** Subscribe to events. Returns unsubscribe function. */
  subscribe(handler: (event: TEvent) => void): () => void;

  /** Flush any buffered events */
  flush(): Promise<void>;

  /** Shutdown the bus and release resources */
  shutdown(): Promise<void>;
}

// ============================================================================
// ObservabilityEvent Union
// ============================================================================

/**
 * Union of all observability event types.
 * Used by the unified ObservabilityBus that handles all signals.
 */
export type ObservabilityEvent = TracingEvent | LogEvent | MetricEvent | ScoreEvent | FeedbackEvent;
