import React from "react";
import { MessageSquare, Star, Edit, Trash2, Calendar, ThumbsUp } from "lucide-react";

export default function PostCard({ post, isAdmin, onEdit, onDelete, onViewDetails, onImageClick, onLike }) {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className="post-card">
      {post.imageUrl && (
        <div className="post-card-image" onClick={() => onImageClick(post.imageUrl)}>
          <img src={post.imageUrl} alt={post.title} loading="lazy" />
        </div>
      )}
      <div className="post-card-content">
        <div className="post-card-meta">
          <span className="post-card-date">
            <Calendar size={14} />
            {formatDate(post.createdAt)}
          </span>
          <div className="post-card-stats">
            <span className="stat-item rating">
              <Star size={14} className="star-filled" />
              {post.avgRating > 0 ? post.avgRating : "N/A"} ({post.reviewCount || 0})
            </span>
            <span className="stat-item comments">
              <MessageSquare size={14} />
              {post.commentsCount || 0}
            </span>
            <span className="stat-item likes" style={{ color: "var(--brand-red, #d72848)" }}>
              <ThumbsUp size={14} />
              {post.likes || 0}
            </span>
          </div>
        </div>
        <h3 className="post-card-title" onClick={() => onViewDetails(post)}>
          {post.title}
        </h3>
        <p className="post-card-snippet">
          {post.content.length > 120
            ? `${post.content.substring(0, 120)}...`
            : post.content}
        </p>
        
        <div className="post-card-actions">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onViewDetails(post)}
            >
              Read & Interact
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onLike(post._id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: "var(--brand-red, #d72848)" }}
            >
              <ThumbsUp size={14} /> Like
            </button>
          </div>
          
          {isAdmin && (
            <div className="admin-actions">
              <button
                type="button"
                className="btn-icon btn-edit"
                title="Edit Post"
                onClick={() => onEdit(post)}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className="btn-icon btn-delete"
                title="Delete Post"
                onClick={() => onDelete(post._id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
