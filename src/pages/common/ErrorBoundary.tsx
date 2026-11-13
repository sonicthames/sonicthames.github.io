import React from "react"

export interface Props {
  readonly fallback: (error: Error) => React.ReactNode
  readonly children: React.ReactNode
  /** A caught error is cleared when this value changes. */
  readonly resetKey?: string
}

interface State {
  readonly error: Error | null
  readonly resetKey: string | undefined
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, resetKey: props.resetKey }
  }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    return {
      error:
        error instanceof Error
          ? error
          : new Error("Unknown render error", { cause: error }),
    }
  }

  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    return props.resetKey === state.resetKey
      ? null
      : { error: null, resetKey: props.resetKey }
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Render error", error, info.componentStack)
  }

  override render() {
    return this.state.error !== null
      ? this.props.fallback(this.state.error)
      : this.props.children
  }
}
