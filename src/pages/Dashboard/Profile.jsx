import React, { useContext, useState, useRef, useEffect } from "react";
import "./Profile.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faPhone,
  faPalette,
  faShieldHalved,
  faArrowRightFromBracket,
  faChevronRight,
  faCamera,
  faCheckCircle,
  faEnvelope,
  faDownload,
  faTriangleExclamation,
  faUserCircle,
  faUpload,
  faTrash,
  faSpinner,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../Context Api/useTheme";
import { AuthContext } from "../../Context Api/AuthContext";
import { useNavigate } from "react-router";
import API_BASE_URL from "../../apiConfig";

const Profile = () => {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        bname: user.bname || "",
        salesGoal: user.salesGoal || "",
      }));
    }
  }, [user]);
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        alert(
          "To install: Tap the 'Share' icon at the bottom of Safari and select 'Add to Home Screen'!",
        );
      } else {
        alert(
          "App is already installed or your browser doesn't support one-click install.",
        );
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const isInstalled = window.matchMedia("(display-mode: standalone)").matches;

  const [viewImage, setViewImage] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: "", title: "" });
  const [bottomSheet, setBottomSheet] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [formData, setFormData] = useState({
    bname: "",
    salesGoal: "",
    oldPass: "",
    newPass: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const getPassStrength = () => {
    const p = formData.newPass;
    if (!p) return { w: "0%", c: "#ccc" };
    if (p.length < 4) return { w: "30%", c: "#ef4444" };
    if (p.length < 8) return { w: "60%", c: "#eab308" };
    return { w: "100%", c: "#22c55e" };
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024)
      return showToast("File too large (Max 2MB)", "error");

    const uploadData = new FormData();
    uploadData.append("profilePic", file);
    uploadData.append("phone", user.phone);

    setUploading(true);
    setBottomSheet(false);

    try {
      const res = await fetch(`${API_BASE_URL}/upload-avatar.php`, {
        method: "POST",
        body: uploadData,
      });
      const result = await res.json();
      if (result.status === "success") {
        updateUser({ profilePic: result.path });
        showToast("Profile picture updated!");
      }
    } catch (err) {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const removeProfilePic = async () => {
    if (!window.confirm("Remove picture?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/update-profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: user.phone, action: "remove_pic" }),
      });
      if ((await res.json()).status === "success") {
        updateUser({ profilePic: null });
        setBottomSheet(false);
        showToast("Picture removed");
      }
    } catch (err) {
      showToast("Error removing picture", "error");
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const payload = {
      phone: user.phone,
      ...formData,
      salesGoal: formData.salesGoal.toString().endsWith("k")
        ? parseFloat(formData.salesGoal) * 1000
        : parseFloat(formData.salesGoal),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/update-profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.status === "success") {
        updateUser({ ...formData, salesGoal: payload.salesGoal });
        setModal({ isOpen: false });
        showToast("Security updated successfully!");
      } else {
        showToast(result.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      {toast.show && (
        <div className={`toast-box ${toast.type}`}>
          <FontAwesomeIcon
            icon={
              toast.type === "success" ? faCircleCheck : faTriangleExclamation
            }
          />
          {toast.msg}
        </div>
      )}

      <header className="profile-header">
        <h1>Account</h1>
      </header>

      <section
        className="glass-card profile-card"
        onClick={() => setBottomSheet(true)}>
        <div className="profile-avatar-wrapper">
          {uploading && (
            <div className="avatar-loading">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
          )}
          {user?.profilePic ? (
            <img
              src={`${API_BASE_URL.replace("/api", "")}/${user.profilePic}`}
              className="avatar-img"
              alt="Avatar"
            />
          ) : (
            <div className="avatar">{user?.fullname?.charAt(0)}</div>
          )}
          <div className="camera-badge">
            <FontAwesomeIcon icon={faCamera} />
          </div>
        </div>
        <div className="profile-info">
          <h2>{user?.fullname}</h2>

          <p className="biz-name">
            {user?.bname ? (
              user.bname
            ) : (
              <span className="setup-nudge">Setup Business Name</span>
            )}
          </p>
          <span className="biz-badge">{user?.category || "Entrepreneur"}</span>
        </div>
      </section>

      <div className="settings-group">
        <h3 className="group-title">Business Details</h3>
        <div className="glass-card settings-list">
          <div
            className="setting-item clickable"
            onClick={() =>
              setModal({ isOpen: true, type: "biz", title: "Business Info" })
            }>
            <div className="setting-left">
              <FontAwesomeIcon icon={faStore} className="set-icon purple" />
              <span>Profile</span>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="chevron" />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3 className="group-title">Security</h3>
        <div className="glass-card settings-list">
          <div
            className="setting-item clickable"
            onClick={() =>
              setModal({
                isOpen: true,
                type: "security",
                title: "Change Password",
              })
            }>
            <div className="setting-left">
              <FontAwesomeIcon icon={faShieldHalved} className="set-icon red" />
              <span>Password</span>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="chevron" />
          </div>
        </div>
      </div>

      <div className="settings-group">
        <h3 className="group-title">Preferences</h3>
        <div className="glass-card settings-list">
          <div
            className="setting-item clickable"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <div className="setting-left">
              <FontAwesomeIcon icon={faPalette} className="set-icon blue" />
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept="image/*"
        onChange={handleFileChange}
      />

      {bottomSheet && (
        <div
          className="bottom-sheet-overlay"
          onClick={() => setBottomSheet(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle"></div>
            <button
              className="sheet-option"
              onClick={() => {
                setViewImage(true);
                setBottomSheet(false);
              }}>
              <FontAwesomeIcon icon={faUserCircle} /> View Picture
            </button>
            <button
              className="sheet-option"
              onClick={() => fileInputRef.current.click()}>
              <FontAwesomeIcon icon={faUpload} /> Update Picture
            </button>
            {user?.profilePic && (
              <button
                className="sheet-option red-text"
                onClick={removeProfilePic}>
                <FontAwesomeIcon icon={faTrash} /> Remove
              </button>
            )}
            <button
              className="sheet-option cancel"
              onClick={() => setBottomSheet(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {modal.isOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <h3>{modal.title}</h3>
            {modal.type === "biz" ? (
              <>
                <div className="input-group-wrapper">
                  <label className="modal-label">Business Display Name</label>
                  <input
                    className="modal-input"
                    placeholder="e.g. Gainly Store"
                    value={formData.bname}
                    onChange={(e) =>
                      setFormData({ ...formData, bname: e.target.value })
                    }
                  />
                </div>

                <div className="input-group-wrapper">
                  <label className="modal-label">Monthly Sales Goal (₦)</label>
                  <input
                    className="modal-input"
                    type="text"
                    placeholder="e.g. 500k or 50000"
                    value={formData.salesGoal}
                    onChange={(e) =>
                      setFormData({ ...formData, salesGoal: e.target.value })
                    }
                  />
                  {formData.salesGoal && (
                    <span className="currency-preview">
                      Target: ₦
                      {Number(
                        formData.salesGoal.toString().replace(/k/i, "000"),
                      ).toLocaleString()}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <input
                  className="modal-input"
                  type="password"
                  placeholder="Old Password"
                  onChange={(e) =>
                    setFormData({ ...formData, oldPass: e.target.value })
                  }
                />
                <input
                  className="modal-input"
                  type="password"
                  placeholder="New Password"
                  onChange={(e) =>
                    setFormData({ ...formData, newPass: e.target.value })
                  }
                />
                <div className="strength-bar">
                  <div
                    style={{
                      width: getPassStrength().w,
                      background: getPassStrength().c,
                    }}></div>
                </div>
              </>
            )}
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setModal({ isOpen: false })}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleUpdate}>
                {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewImage && (
        <div
          className="image-viewer-overlay"
          onClick={() => setViewImage(false)}>
          <img
            src={
              user?.profilePic
                ? `${API_BASE_URL.replace("/api", "")}/${user.profilePic}`
                : "/default.png"
            }
            alt="Full"
          />
          <button className="close-viewer" onClick={() => setViewImage(false)}>
            Close
          </button>
        </div>
      )}
      {!isInstalled && (
        <div className="profile-setting-item" onClick={handleInstallClick}>
          <FontAwesomeIcon icon={faDownload} />
          <span>Install App to Home Screen</span>
        </div>
      )}

      <section className="profile-section">
        <h3>Support</h3>

        <a href="mailto:support@gainly.com.ng" className="support-item">
          <div className="support-icon purple">
            <FontAwesomeIcon icon={faEnvelope} />
          </div>
          <div className="support-text">
            <span>Email Support</span>
            <p>Response within 24 hours</p>
          </div>
        </a>

        <a href="https://wa.me/2347030318983" className="support-item">
          <div className="support-icon green">
            {/* <FontAwesomeIcon icon={faWhatsapp} /> */} <p>WA</p>
          </div>
          <div className="support-text">
            <span>Chat with CEO</span>
            <p>Quick help via WhatsApp</p>
          </div>
        </a>
      </section>

      {showLogout && (
        <div className="modal-overlay">
          <div className="glass-card modal-content logout-confirm">
            <h3 style={{ color: "white" }}>Logout CEO?</h3>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowLogout(false)}>
                No
              </button>
              <button
                className="save-btn red-bg"
                onClick={() => {
                  logout();
                  navigate("/");
                }}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="logout-btn" onClick={() => setShowLogout(true)}>
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Profile;
