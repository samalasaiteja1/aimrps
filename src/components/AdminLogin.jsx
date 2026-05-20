import React, { useState } from "react";
import { X, Lock, AlertCircle } from "lucide-react";

export default function AdminLogin({ isOpen, onClose, onLoginSuccess, apiUrl }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to authenticate");
      }

      localStorage.setItem("aimrps_admin_token", data.token);
      onLoginSuccess(data.token);
      setPassword("");
      onClose();
    } catch (err) {
      setError(err.message || "Invalid password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-auth">
        <div className="modal-header">
          <h3>
            <Lock size={18} className="icon-lock" />
            Admin Authentication
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-desc">
            Enter the admin password to unlock management capabilities (creation, deletion, and editing of posts).
          </p>

          {error && (
            <div className="error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="adminPassword">Password</label>
            <input
              type="password"
              id="adminPassword"
              placeholder="Enter admin password (default: admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
