import React, { useState, useEffect } from "react";
import { X, Star, MessageSquare, Trash2, Edit, Send, Calendar } from "lucide-react";

export default function PostDetailsModal({ isOpen, onClose, post, isAdmin, apiUrl, onImageClick }) {
  const [activeTab, setActiveTab] = useState("comments"); // "comments" or "reviews"
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment form state
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Editing states
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentAuthor, setEditCommentAuthor] = useState("");
  const [editCommentText, setEditCommentText] = useState("");

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewAuthor, setEditReviewAuthor] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState("");

  useEffect(() => {
    if (isOpen && post) {
      fetchPostDetails();
    } else {
      setPostDetails(null);
      setLoading(true);
      setError("");
    }
  }, [isOpen, post]);

  if (!isOpen || !post) return null;

  const fetchPostDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/posts/${post._id}`);
      if (!response.ok) {
        throw new Error("Failed to load details");
      }
      const data = await response.json();
      setPostDetails(data);
    } catch (err) {
      setError(err.message || "Could not retrieve post comments/reviews.");
    } finally {
      setLoading(false);
    }
  };

  // --- COMMENT ACTIONS ---
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentAuthor.trim() || !commentText.trim()) return;

    setCommentSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/posts/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: commentAuthor.trim(),
          text: commentText.trim(),
        }),
      });

      if (!response.ok) throw new Error("Could not add comment");

      setCommentText("");
      // Refetch details
      await fetchPostDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleStartEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditCommentAuthor(comment.author);
    setEditCommentText(comment.text);
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editCommentAuthor.trim() || !editCommentText.trim()) return;
    try {
      const response = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: editCommentAuthor.trim(),
          text: editCommentText.trim(),
        }),
      });

      if (!response.ok) throw new Error("Could not update comment");

      setEditingCommentId(null);
      await fetchPostDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const response = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete comment");

      await fetchPostDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- REVIEW ACTIONS ---
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewText.trim()) return;

    setReviewSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/posts/${post._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: reviewAuthor.trim(),
          rating: reviewRating,
          text: reviewText.trim(),
        }),
      });

      if (!response.ok) throw new Error("Could not submit review");

      setReviewText("");
      setReviewRating(5);
      await fetchPostDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleStartEditReview = (review) => {
    setEditingReviewId(review._id);
    setEditReviewAuthor(review.author);
    setEditReviewRating(review.rating);
    setEditReviewText(review.text);
  };

  const handleSaveEditReview = async (reviewId) => {
    if (!editReviewAuthor.trim() || !editReviewText.trim()) return;
    try {
      const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: editReviewAuthor.trim(),
          rating: editReviewRating,
          text: editReviewText.trim(),
        }),
      });

      if (!response.ok) throw new Error("Could not update review");

      setEditingReviewId(null);
      await fetchPostDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const response = await fetch(`${apiUrl}/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete review");

      await fetchPostDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStars = (ratingVal) => {
    return (
      <div className="stars-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= ratingVal ? "star-filled" : "star-empty"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card modal-lg">
        <div className="modal-header">
          <h3>Community Board Post</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body post-details-grid">
          {/* Left Column: Post Details */}
          <div className="post-details-left">
            {post.imageUrl && (
              <div className="post-detail-image clickable-image" onClick={() => onImageClick(post.imageUrl)}>
                <img src={post.imageUrl} alt={post.title} />
              </div>
            )}
            <h2 className="post-detail-title">{post.title}</h2>
            <div className="post-detail-date">
              <Calendar size={14} />
              Posted on {formatDate(post.createdAt)}
            </div>
            <div className="post-detail-body">
              {post.content.split("\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Right Column: Comments & Reviews */}
          <div className="post-details-right">
            <div className="tabs-header">
              <button
                type="button"
                className={`tab-btn ${activeTab === "comments" ? "active" : ""}`}
                onClick={() => setActiveTab("comments")}
              >
                <MessageSquare size={16} />
                <span>Comments</span>
                {postDetails && (
                  <span className="tab-count">{postDetails.comments.length}</span>
                )}
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveTab("reviews")}
              >
                <Star size={16} />
                <span>Reviews</span>
                {postDetails && (
                  <span className="tab-count">
                    {postDetails.avgRating > 0 ? `${postDetails.avgRating}★` : "0"}
                  </span>
                )}
              </button>
            </div>

            <div className="tab-content-panel">
              {loading ? (
                <div className="tab-loading">
                  <div className="spinner"></div>
                  <p>Loading discussions...</p>
                </div>
              ) : error ? (
                <div className="tab-error">
                  <p>{error}</p>
                </div>
              ) : activeTab === "comments" ? (
                // --- COMMENTS PANEL ---
                <div className="comments-pane">
                  {/* Create Comment Form */}
                  <form onSubmit={handleAddComment} className="interactive-form">
                    <h4>Leave a Comment</h4>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        required
                        disabled={commentSubmitting}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        rows="2"
                        placeholder="Join the discussion..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        required
                        disabled={commentSubmitting}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm btn-icon-text"
                      disabled={commentSubmitting}
                    >
                      <Send size={14} />
                      {commentSubmitting ? "Sending..." : "Submit"}
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="interactions-list">
                    {postDetails.comments.length === 0 ? (
                      <p className="empty-text">No comments yet. Be the first to comment!</p>
                    ) : (
                      postDetails.comments.map((comment) => (
                        <div key={comment._id} className="interaction-item">
                          {editingCommentId === comment._id ? (
                            // Inline comment editing
                            <div className="edit-inline-form">
                              <input
                                type="text"
                                value={editCommentAuthor}
                                onChange={(e) => setEditCommentAuthor(e.target.value)}
                                className="edit-input-author"
                                placeholder="Author Name"
                              />
                              <textarea
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                className="edit-input-text"
                                rows="2"
                                placeholder="Comment content"
                              />
                              <div className="edit-inline-actions">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSaveEditComment(comment._id)}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Comment display
                            <>
                              <div className="interaction-meta">
                                <span className="interaction-author">{comment.author}</span>
                                <span className="interaction-date">{formatDate(comment.createdAt)}</span>
                              </div>
                              <p className="interaction-text">{comment.text}</p>
                              <div className="interaction-actions">
                                <button
                                  type="button"
                                  className="btn-text btn-edit"
                                  onClick={() => handleStartEditComment(comment)}
                                >
                                  <Edit size={12} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn-text btn-delete"
                                  onClick={() => handleDeleteComment(comment._id)}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                // --- REVIEWS PANEL ---
                <div className="reviews-pane">
                  {/* Create Review Form */}
                  <form onSubmit={handleAddReview} className="interactive-form">
                    <h4>Add a Review</h4>
                    <div className="form-group star-rating-group">
                      <label>Rating:</label>
                      <div className="star-rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star-btn ${
                              (reviewHoverRating || reviewRating) >= star ? "active" : ""
                            }`}
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHoverRating(star)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            disabled={reviewSubmitting}
                          >
                            <Star size={20} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        required
                        disabled={reviewSubmitting}
                      />
                    </div>
                    <div className="form-group">
                      <textarea
                        rows="2"
                        placeholder="Write your review here..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                        disabled={reviewSubmitting}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm btn-icon-text"
                      disabled={reviewSubmitting}
                    >
                      <Send size={14} />
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>

                  {/* Reviews List */}
                  <div className="interactions-list">
                    {postDetails.reviews.length === 0 ? (
                      <p className="empty-text">No reviews yet. Be the first to rate!</p>
                    ) : (
                      postDetails.reviews.map((review) => (
                        <div key={review._id} className="interaction-item">
                          {editingReviewId === review._id ? (
                            // Inline review editing
                            <div className="edit-inline-form">
                              <div className="form-group star-rating-group inline-edit">
                                <label>Rating:</label>
                                <div className="star-rating-input">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      className={`star-btn ${
                                        editReviewRating >= star ? "active" : ""
                                      }`}
                                      onClick={() => setEditReviewRating(star)}
                                    >
                                      <Star size={16} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input
                                type="text"
                                value={editReviewAuthor}
                                onChange={(e) => setEditReviewAuthor(e.target.value)}
                                className="edit-input-author"
                                placeholder="Author Name"
                              />
                              <textarea
                                value={editReviewText}
                                onChange={(e) => setEditReviewText(e.target.value)}
                                className="edit-input-text"
                                rows="2"
                                placeholder="Review content"
                              />
                              <div className="edit-inline-actions">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setEditingReviewId(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSaveEditReview(review._id)}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Review display
                            <>
                              <div className="interaction-meta">
                                <span className="interaction-author">{review.author}</span>
                                <span className="interaction-date">{formatDate(review.createdAt)}</span>
                              </div>
                              <div className="review-stars-display">
                                {renderStars(review.rating)}
                              </div>
                              <p className="interaction-text">{review.text}</p>
                              <div className="interaction-actions">
                                <button
                                  type="button"
                                  className="btn-text btn-edit"
                                  onClick={() => handleStartEditReview(review)}
                                >
                                  <Edit size={12} /> Edit
                                </button>
                                <button
                                  type="button"
                                  className="btn-text btn-delete"
                                  onClick={() => handleDeleteReview(review._id)}
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
