import { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [showModal, setShowModal] = useState(true);
  const [showShine, setShowShine] = useState(true);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("gainly-theme") || "light"
  );

  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowShine(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("gainly-theme", theme);
  }, [theme]);

  const COLORS = [
    "#FF6B6B",
    "#FFD166",
    "#4ADE80",
    "#60A5FA",
    "#C084FC",
    "#FF9F1C",
  ];

  const triggerParticles = () => {
    const count = 28;
    const now = Date.now();
    const burst = Array.from({ length: count }).map((_, i) => {
      const vx = Math.round(Math.random() * 520 - 260);

      const vy = Math.round(-(160 + Math.random() * 360));
      const size = Math.round(6 + Math.random() * 14);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const rot = `${Math.round((Math.random() - 0.5) * 1080)}deg`;
      const shape = Math.random() > 0.68 ? "circle" : "rect";
      const duration = 900 + Math.round(Math.random() * 900);
      const delay = Math.round(Math.random() * 120);
      return {
        id: `${now}-${i}`,
        vx,
        vy,
        size,
        color,
        rot,
        shape,
        duration,
        delay,
      };
    });

    setParticles(burst);

    const longest = Math.max(...burst.map((p) => p.duration + p.delay));
    setTimeout(() => setParticles([]), longest + 500);
  };
  const handleJoinWaitlist = () => {
    window.open(
      "https://wa.me/2347030318983?text=Hi%20I%20want%20early%20access%20to%20Gainly.",
      "_blank"
    );

    supabase
      .from("waitlist_events")
      .insert([
        {
          intent: "whatsapp_click",
          source: "landing_page",
        },
      ])
      .catch((err) => {
        console.error("Waitlist tracking failed:", err);
      });
  };

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {showShine && (
        <div className="shine-burst">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card glass">
            <h2>Welcome to Gainly 👋</h2>
            <p>
              Built for student business owners who are tired of guessing and
              saying “we thank God”.
            </p>
            <button
              onClick={() => {
                triggerParticles();
                setTimeout(() => setShowModal(false), 400);
              }}>
              Enter Gainly
            </button>
            <div className="particle-layer">
              {particles.map((p) => (
                <span
                  key={p.id}
                  className="particle"
                  data-shape={p.shape === "circle" ? "circle" : "rect"}
                  style={{
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    background: p.color,

                    "--x": `${p.vx}px`,
                    "--y": `${p.vy}px`,
                    "--rot": p.rot,

                    animationDuration: `${p.duration}ms`,
                    animationDelay: `${p.delay}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>

      <main className={`app ${showModal ? "blurred" : ""}`}>
        <section className="hero">
          <div className="logo-glow">Gainly</div>

          <h1>
            Stop forgetting to market.
            <br />
            <span>Start knowing where your money goes.</span>
          </h1>

          <p>
            Gainly helps student business owners track sales, get reminders, and
            know what to do next.
          </p>

          <button onClick={handleJoinWaitlist} className="cta-btn shine">
            Join WhatsApp Waitlist
          </button>
        </section>

        <section className="section glass">
          <h2>Be honest — this has happened to you</h2>
          <ul>
            <li>Planned to post but forgot</li>
            <li>Made sales but don't know total</li>
            <li>Say “we thank God” when asked about business</li>
            <li>Some weeks dry, no idea why</li>
          </ul>
        </section>

        <section className="section">
          <h2>One tool. Three habits.</h2>

          <div className="card-grid">
            <div className="card glass">
              <h3>Marketing Reminders</h3>
              <p>
                Never forget to post again. Get timely nudges on when and what
                to promote so your business stays visible.
              </p>
            </div>

            <div className="card glass">
              <h3>Sales Tracking</h3>
              <p>
                Know what's selling and when. Log sales in seconds and see
                what’s selling, when, and to who — no accounting stress.
              </p>
            </div>

            <div className="card glass">
              <h3>Simple Insights</h3>
              <p>
                Clear advice, no confusing charts. Clear advice like “Post
                earlier on Fridays” or “Your top seller is Hair Oil.”
              </p>
            </div>
          </div>
        </section>

        <section className="section proof">
          <p>
            Built with <strong>Unilorin student vendors</strong> in mind.
            <br />
            Focused on real daily business problems.
          </p>
        </section>

        <section className="section cta-section glass">
          <h2>Get early access</h2>
          <p>We’re opening this first to Unilorin students.</p>

          <a
            href="https://wa.me/2347030318983?text=Hi%20I%20want%20early%20access%20to%20Gainly."
            className="cta-btn shine">
            Join WhatsApp Waitlist
          </a>
        </section>
        <footer className="footer">
          © {new Date().getFullYear()} Gainly — Built for Unilorin student
          vendors
        </footer>
      </main>
    </>
  );
}
