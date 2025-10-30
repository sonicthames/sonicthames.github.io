import React from "react"

export interface Props {
  readonly fallback: (error: Error) => React.ReactNode
  readonly children: React.ReactNode
}

interface State {
  readonly error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      error: null,
    }
  }

  componentDidCatch(error: Error) {
    this.setState({ error })
  }

  render() {
    return this.state.error !== null
      ? this.props.fallback(this.state.error)
      : this.props.children
  }
}
