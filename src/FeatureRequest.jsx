import { useState } from "react";

import { supabase } from "./App";

import "./FeaturesRequest.css";

function FeatureRequest() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const maxChars = 500;

  const submitSuggestion = async () => {
    setError("");
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter one clear suggestion.");
      return;
    }
    if (trimmed.length > maxChars) {
      setError(`Please keep suggestions under ${maxChars} characters.`);
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from("feature_requests")
        .insert([{ content: trimmed }]);

      setLoading(false);

      if (insertError) {
        console.error("Feature request insert error:", insertError);
        setError("Could not submit right now. Try again in a bit.");
        return;
      }

      // success
      setText("");
      setSent(true);
      // auto-hide the success message after 3.5s
      setTimeout(() => setSent(false), 3500);
    } catch (e) {
      console.error(e);
      setLoading(false);
      setError("An unexpected error occurred.");
    }
  };

  return (
    <section
      className="section feature-section glass"
      aria-labelledby="feature-title">
      <h2 id="feature-title">Gainly is being built for you</h2>
      <p style={{ marginTop: 8, marginBottom: 12, color: "var(--muted)" }}>
        What’s one feature that would change your business? Write it below —
        short and direct.
      </p>

      <textarea
        className="feature-textarea"
        placeholder="e.g., 'Auto reminders for weekends', 'Export daily sales to Excel', 'Auto-reply for orders via WhatsApp'..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={maxChars}
        rows={4}
        aria-label="Feature suggestion"
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 10,
        }}>
        <button
          className="cta-btn feature-btn"
          onClick={submitSuggestion}
          disabled={loading}
          aria-disabled={loading}>
          {loading ? "Sending..." : "Submit Suggestion"}
        </button>

        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          <span>{text.length}</span>/<span>{maxChars}</span>
        </div>
      </div>

      {sent && (
        <div className="feature-thanks" role="status" style={{ marginTop: 10 }}>
          Thank you! We’re listening 💚
        </div>
      )}

      {error && (
        <div style={{ color: "#ff7a7a", marginTop: 10, fontSize: 13 }}>
          {error}
        </div>
      )}
    </section>
  );
}

export default FeatureRequest;
