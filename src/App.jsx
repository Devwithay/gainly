import { useEffect, useState } from "react";
import "./App.css";
import { createClient } from "@supabase/supabase-js";

import FeatureRequest from "./FeatureRequest";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
console.log(
  "Supabase env check:",
  !!import.meta.env.VITE_SUPABASE_URL,
  !!import.meta.env.VITE_SUPABASE_ANON_KEY
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
  const handleJoinWaitlist = async () => {
    const whatsappUrl =
      "https://wa.me/2347030318983?text=Hi%20I%20want%20early%20access%20to%20Gainly.";

    const insertPromise = supabase.from("waitlist_events").insert([
      {
        intent: "whatsapp_click",
        source: "landing_page",
      },
    ]);

    // Race the insert against a short timeout (150ms)
    await Promise.race([
      insertPromise,
      new Promise((resolve) => setTimeout(resolve, 150)),
    ]);

    // Redirect immediately after
    window.open(whatsappUrl, "_blank");
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
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card glass" aria-labelledby="welcome-title">
            <h2 id="welcome-title" className="modal-headline">
              Turn your Student Business into a Brand 🚀
            </h2>

            <p className="modal-subhead">
              Gainly helps you grow smart, track every Naira, and stay
              consistent. Join the league of elite Unilorin vendors.
            </p>

            <div className="modal-actions">
              {/* Enter (reveal the site) */}
              <button
                className="cta-btn modal-enter"
                onClick={() => {
                  // spark particles and reveal
                  triggerParticles?.();
                  setTimeout(() => setShowModal(false), 450);
                }}>
                Enter Gainly
              </button>

              {/* Join Waitlist (keeps instant feeling via handleJoinWaitlist) */}
              <button className="cta-btn outline" onClick={handleJoinWaitlist}>
                Join Waitlist
              </button>
            </div>

            <div className="lead-badge" aria-hidden="true">
              🎁 Plus: Get our <strong>'Vendor Growth Blueprint'</strong> free
              when you join the waitlist.
            </div>

            {/* Particles layer stays here (if you had it) */}
            <div className="particle-layer" aria-hidden="true">
              {particles?.map((p) => (
                <span
                  key={p.id}
                  className="particle"
                  style={{
                    width: p.size,
                    height: p.size,
                    "--x": `${p.x}px`,
                    "--y": `${p.y}px`,
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
        <section className="hero" aria-labelledby="hero-title">
          <div className="logo-glow">Gainly</div>

          <h1 id="hero-title" className="hero-title">
            Turn your Student Business into a Brand 🚀
            <br />
            <span className="hero-subtitle">
              Gainly helps you grow smart, track every Naira, and stay
              consistent. Join the league of elite Unilorin vendors.
            </span>
          </h1>

          <p className="hero-niche">
            Tailored for Bakers, Fashion Designers, Data Vendors, and every
            student hustler.
          </p>

          <p className="hero-desc">
            Gainly you track sales, stay visible to customers, and make smarter
            decisions — without complexity.
          </p>

          <button
            onClick={handleJoinWaitlist}
            className="cta-btn shine hero-cta">
            Join WhatsApp Waitlist
          </button>
        </section>

        <section className="section glass">
          <h2>Growing a student business comes with real challenges</h2>
          <ul>
            <li>Marketing can sometimes be inconsistent during busy weeks</li>
            <li>Sales happen daily, but totals aren’t always clear</li>
            <li>
              Some products sell faster than others — without obvious patterns
            </li>
            <li>Growth feels unpredictable, even with hard work</li>
          </ul>
          <p>
            That's is where{" "}
            <span style={{ color: "green", fontWeight: "bolder" }}>Gainly</span>{" "}
            comes in.
          </p>
        </section>

        <section className="section">
          <h2>One platform. Three growth systems.</h2>

          <div className="card-grid">
            <div className="card glass">
              <h3>Strategic Visibility</h3>
              <p>
                Stay top-of-mind with customers through smart reminders on when
                and what to promote — based on your activity.
              </p>
            </div>

            <div className="card glass">
              <h3>Sales Clarity</h3>
              <p>
                Record sales in seconds and see clear totals by day, product,
                and period — without spreadsheets.
              </p>
            </div>

            <div className="card glass">
              <h3>Actionable Insights</h3>
              <p>
                Go beyond vibes. Understand what’s working, what needs
                attention, and where your profit truly comes from.
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
          <p>
            We’re onboarding a small group of Unilorin student vendors to shape
            the first version of Gainly.
          </p>

          <button onClick={handleJoinWaitlist} className="cta-btn shine">
            Join our WhatsApp Waitlist
          </button>
        </section>
        <FeatureRequest />
        <footer className="footer">
          © {new Date().getFullYear()} Gainly — Built for Unilorin student
          vendors
        </footer>
      </main>
    </>
  );
}
