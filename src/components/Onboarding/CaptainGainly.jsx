import React, { useContext, useEffect, useState, useMemo, useRef } from "react";
import { AuthContext } from "../../Context Api/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faArrowDown,
  faShareFromSquare,
  faPlusSquare,
} from "@fortawesome/free-solid-svg-icons";
import "./CaptainGainly.css";

const CaptainGainly = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  const steps = useMemo(
    () => [
      {
        title: `Welcome CEO, ${auth?.user?.firstName || "Chief"}! 🚀`,
        text: "Congratulations on signing up on gainly! Let's me walk you through the app",
        target: null,
      },
      {
        title: "Install Gainly",
        text: "Before we start, let me help you install Gainly to your phone for easy access.",
        target: null,
      },
      {
        title: "The Sales Hub",
        text: "Great! Now, let's enter  Sales Hub, your revenue command center to record your first sale. Click the highlighted icon!",
        target: "nav-sales-hub",
      },
      {
        title: "Log Your First Sale",
        text: "Welcome to the control center! Click 'Add New Sale' to start recording your business revenue.",
        target: "btn-add-sale",
      },
      {
        title: "Boom! You did it! 🎉",
        text: "Your sale is recorded. Now, let's generate a professional receipt to send to your customer. scroll down 👇",
        target: "btn-receipts",
      },
      {
        title: "Select the Sale",
        text: "Tap on the sale you just added to open the receipt.",
        target: "first-sale-item",
      },
      {
        title: "Professionalism! ✨",
        text: "This is how you build trust, CEO. Send this to your customer so they know you're the real deal! scroll down 👇",
        target: "btn-whatsapp-share",
      },
      {
        title: "Wait, one more thing...",
        text: "To know your true profit, we must track what goes out too! Expenses are things like data, rent, or transport. Do you have any to log?",
        target: null,
      },
      {
        title: "Expense Tracking",
        text: "Click here to Log and track your expenses, to make sure  you are always cautios on how you spend. scroll down 👇",
        target: "btn-expenses",
      },
      {
        title: "Log Expense",
        text: "Click 'Add New' to record a cost. scroll up 👆",
        target: "btn-add-expense",
      },
      {
        title: "Insights & Growth",
        text: "This is where we turn your numbers into a growth map. Check your progress here!",
        target: "nav-insights",
      },
      {
        title: "Your Profile",
        text: "Final stop! Customize your business details here.",
        target: "nav-profile",
      },
      {
        title: "You're Ready! 🚀",
        text: "You've mastered the basics. Explore 'Track Sales' and other features at your own pace. You're going to do great things!",
        target: null,
      },
    ],
    [auth?.user?.firstName],
  );

  useEffect(() => {
    const stepIdx = auth?.onboardingStep;
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (stepIdx >= 0 && steps[stepIdx]?.target) {
      const targetId = steps[stepIdx].target;
      const update = () => {
        const el = document.getElementById(targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top === 0 && rect.width === 0) {
            setCoords(null);
            return;
          }
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          setCoords({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            targetId,
          });
          document.documentElement.style.setProperty("--hole-x", `${cx}px`);
          document.documentElement.style.setProperty("--hole-y", `${cy}px`);

          let holeWidth = "40px";
          if (["btn-add-sale", "btn-whatsapp-share"].includes(targetId))
            holeWidth = "160px";
          if (["first-sale-item"].includes(targetId)) holeWidth = "207px";
          if (
            ["btn-receipts", "btn-expenses", "nav-insights"].includes(targetId)
          )
            holeWidth = "90px";
          document.documentElement.style.setProperty("--hole-r", holeWidth);
        } else {
          setCoords(null);
        }
      };
      intervalRef.current = setInterval(update, 100);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("resize", update);
        clearInterval(intervalRef.current);
      };
    } else {
      setCoords(null);
    }
  }, [auth?.onboardingStep, steps]);

  if (!auth?.user || auth.onboardingStep >= steps.length) return null;

  const isTargetAtTop = coords && coords.top < window.innerHeight * 0.4;

  const shouldShow =
    !isPaused &&
    (auth.onboardingStep < 2 ||
      coords !== null ||
      [7, 10, 12].includes(auth.onboardingStep));

  if (!shouldShow) return null;

  return (
    <div className="onboarding-root">
      <div
        className={`onboarding-overlay ${coords ? "mask-active" : "full-blur"}`}
      />

      {coords && (
        <div
          className="spotlight-clickable"
          style={{
            top: coords.top - 10,
            left: coords.left - 10,
            width: coords.width + 20,
            height: coords.height + 20,
            borderRadius: "16px",
          }}
          onClick={() => {
            const el = document.getElementById(coords.targetId);
            if (el) {
              if (coords.targetId === "nav-insights") {
                setIsPaused(true);
                el.click();

                setTimeout(() => {
                  auth.completeStep(auth.onboardingStep);
                  setIsPaused(false);
                }, 7500);
              } else {
                if (![3, 9].includes(auth.onboardingStep))
                  auth.completeStep(auth.onboardingStep);
                el.click();
              }
            }
          }}>
          <div className="onboarding-arrow">
            <FontAwesomeIcon icon={faArrowDown} />
          </div>
        </div>
      )}

      <div
        className={`captain-card ${coords ? "card-elevated" : ""} ${isTargetAtTop ? "card-at-bottom" : ""}`}>
        <div className="ai-icon-wrapper">
          <FontAwesomeIcon icon={faRobot} />
        </div>
        <h3>{steps[auth.onboardingStep].title}</h3>
        <p>{steps[auth.onboardingStep].text}</p>

        {auth.onboardingStep === 0 && (
          <button
            className="onboarding-btn"
            onClick={() => auth.completeStep(0)}>
            Let's Go!
          </button>
        )}

        {auth.onboardingStep === 1 && (
          <div className="install-logic">
            {!platform ? (
              <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                <button
                  className="onboarding-btn"
                  onClick={() => setPlatform("android")}>
                  Android
                </button>
                <button
                  className="onboarding-btn"
                  style={{ background: "#333" }}
                  onClick={() => setPlatform("ios")}>
                  iPhone
                </button>
              </div>
            ) : (
              <div className="ios-guide">
                {platform === "android" ? (
                  <p>
                    Tap the <strong>Install button</strong> to add Gainly to
                    your home screen.
                  </p>
                ) : (
                  <>
                    <p>
                      1. Tap <strong>Share</strong>{" "}
                      <FontAwesomeIcon icon={faShareFromSquare} /> icon at the
                      bottom of Safari
                    </p>
                    <p>
                      2. Tap <strong>Add to Home Screen</strong>{" "}
                      <FontAwesomeIcon icon={faPlusSquare} />
                    </p>
                  </>
                )}
                <button
                  className="onboarding-btn"
                  onClick={() => {
                    if (platform === "android") auth.triggerAndroidInstall();
                    auth.completeStep(1);
                  }}>
                  {platform === "android" ? "Install Gainly" : "I've done that"}
                </button>
              </div>
            )}
          </div>
        )}

        {auth.onboardingStep === 6 && (
          <button
            className="onboarding-btn"
            onClick={() => {
              auth.completeStep(6);
              navigate("/sales-hub");
            }}>
            I have already sent it
          </button>
        )}

        {auth.onboardingStep === 7 && (
          <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
            <button
              className="onboarding-btn"
              onClick={() => {
                navigate("/sales-hub");
                auth.completeStep(7);
              }}>
              Yes, I do
            </button>
            <button
              className="onboarding-btn"
              style={{ background: "#666" }}
              onClick={() => {
                navigate("/insights");
                auth.completeStep(7, 10);
              }}>
              Not now
            </button>
          </div>
        )}

        {auth.onboardingStep === 12 && (
          <button
            className="onboarding-btn"
            onClick={() => auth.completeStep(12)}>
            Finish Tutorial
          </button>
        )}

        {auth.onboardingStep >= 2 && (
          <button className="skip-link" onClick={() => auth.completeStep(20)}>
            Skip Tutorial
          </button>
        )}
      </div>
    </div>
  );
};

export default CaptainGainly;
