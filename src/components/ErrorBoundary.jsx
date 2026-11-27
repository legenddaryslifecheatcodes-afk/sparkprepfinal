import { Component } from "react";

// React error boundaries must be class components -- there's no hook
// equivalent. Without one anywhere in the app, any uncaught render error
// (e.g. a failed texture load in the 3D proof viewer) takes down the
// entire page to a blank white screen instead of just the piece that broke.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info);
    // Tell the owner's Insights page that a part of the page crashed (see public/track.js). Never throws.
    try { window.spTrouble && window.spTrouble("crash", String((error && error.message) || error), ""); } catch (_) { /* ignore */ }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
