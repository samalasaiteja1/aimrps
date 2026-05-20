import React, { useState, useEffect } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";

export default function PostForm({ isOpen, onClose, onSave, editingPost, token, apiUrl }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || "");
      setContent(editingPost.content || "");
      setImagePreview(editingPost.imageUrl || "");
      setImageFile(null);
    } else {
      setTitle("");
      setContent("");
      setImagePreview("");
      setImageFile(null);
    }
    setError("");
  }, [editingPost, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should not exceed 5MB.");
      return;
    }

    // Check type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, JPEG, WEBP).");
      return;
    }

    setError("");
    setImageFile(file);

    // Create local URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = editingPost ? `${apiUrl}/posts/${editingPost._id}` : `${apiUrl}/posts`;
      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save post");
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message || "An error occurred while saving the post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            <FileText size={18} />
            {editingPost ? "Edit Post" : "Create New Post"}
          </h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="postTitle">Title</label>
            <input
              type="text"
              id="postTitle"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="postContent">Content</label>
            <textarea
              id="postContent"
              rows="6"
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Post Image</label>
            <div className="upload-zone">
              <input
                type="file"
                id="postImage"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                style={{ display: "none" }}
              />
              <label htmlFor="postImage" className="upload-label">
                <Upload size={24} />
                <span>Choose Image or Drag & Drop</span>
                <span className="upload-hint">JPG, JPEG, PNG, or WEBP up to 5MB</span>
              </label>
            </div>

            {imagePreview && (
              <div className="image-upload-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-preview-btn"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  disabled={loading}
                >
                  <X size={14} />
                </button>
              </div>
            )}
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
              {loading ? "Saving..." : editingPost ? "Save Changes" : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
