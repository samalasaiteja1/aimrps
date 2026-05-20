import React from "react";
import {
  Handshake,
  Mail,
  MapPin,
  Megaphone,
  Menu,
  Phone,
  ShieldCheck,
  Users,
  X,
  Lock,
  Unlock,
  Plus,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";

// Subcomponents
import PostCard from "./components/PostCard";
import AdminLogin from "./components/AdminLogin";
import PostForm from "./components/PostForm";
import PostDetailsModal from "./components/PostDetailsModal";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#community", label: "Community Board" },
  { href: "#contact", label: "Contact" },
];

const services = [
  {
    icon: Users,
    title: "Community Support",
    description:
      "Helping families and youth through guidance, access to resources, and community-led support networks.",
  },
  {
    icon: Megaphone,
    title: "Social Awareness Programs",
    description:
      "Organizing awareness drives, educational sessions, and outreach activities to strengthen civic participation.",
  },
  {
    icon: ShieldCheck,
    title: "Reservation Advocacy",
    description:
      "Promoting policy awareness and legal support for fair reservation rights and social justice initiatives.",
  },
  {
    icon: Handshake,
    title: "Events and Campaigns",
    description:
      "Coordinating campaigns, public meetings, and grassroots events to mobilize communities for positive change.",
  },
];

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: "",
  });

  // State for posts, auth, and theme
  const [posts, setPosts] = React.useState([]);
  const [loadingPosts, setLoadingPosts] = React.useState(true);
  const [adminToken, setAdminToken] = React.useState(
    localStorage.getItem("aimrps_admin_token") || null
  );
  const [theme, setTheme] = React.useState(
    localStorage.getItem("aimrps_theme") || "light"
  );

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [lightboxImage, setLightboxImage] = React.useState(null);

  const [selectedPost, setSelectedPost] = React.useState(null);
  const [editingPost, setEditingPost] = React.useState(null);

  const handleImageClick = (imageUrl) => {
    setLightboxImage(imageUrl);
  };

  const closeMenu = () => setMenuOpen(false);

  // Handle Theme Toggle
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aimrps_theme", theme);
  }, [theme]);

  // Fetch posts from MongoDB
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await fetch(`${API_URL}/posts`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Verify Admin Token on mount
  React.useEffect(() => {
    fetchPosts();

    if (adminToken) {
      fetch(`${API_URL}/admin/verify`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            localStorage.removeItem("aimrps_admin_token");
            setAdminToken(null);
          }
        })
        .catch(() => {
          localStorage.removeItem("aimrps_admin_token");
          setAdminToken(null);
        });
    }
  }, [adminToken]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const ownerEmail = "dr.islamuddin12@gmail.com";
    const subject = `AIMRPS Contact - ${formData.name}`;
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      "",
      "Message:",
      formData.message,
    ].join("\n");

    const mailtoLink = `mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  // Admin Log Out
  const handleLogout = () => {
    localStorage.removeItem("aimrps_admin_token");
    setAdminToken(null);
  };

  // Like Post Action
  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, { method: "PUT" });
      if (!response.ok) throw new Error("Could not like post");
      const data = await response.json();
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p))
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost((prev) => ({ ...prev, likes: data.likes }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Post Action
  const handleDeletePost = async (postId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This will permanently delete all associated comments and reviews."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (!response.ok) throw new Error("Could not delete post");

      // Refetch posts list
      fetchPosts();
      
      // Close details if the deleted post was open
      if (selectedPost && selectedPost._id === postId) {
        setIsDetailsOpen(false);
      }
    } catch (err) {
      alert(err.message || "Failed to delete post.");
    }
  };

  // Trigger Edit Form
  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  // Trigger Create Form
  const handleCreatePost = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  // View post details, reviews & comments
  const handleViewDetails = (post) => {
    setSelectedPost(post);
    setIsDetailsOpen(true);
  };

  return (
    <div className="site">
      <header className="navbar">
        <div className="container nav-inner">
          <a href="#home" className="brand" onClick={closeMenu}>
            <div className="logo-placeholder" aria-hidden="true">
              AIMRPS
            </div>
            <div>
              <p className="brand-title">All India Muslim Reservation Porata Samithi</p>
              <p className="brand-subtitle">Unity | Justice | Representation</p>
            </div>
          </a>

          <button
            type="button"
            className="menu-btn"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              className="btn-theme-toggle"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            
            {/* Admin Action Button in Nav */}
            {adminToken ? (
              <button
                type="button"
                className="btn btn-secondary btn-nav-auth"
                onClick={handleLogout}
              >
                <Unlock size={14} className="icon-auth" />
                Logout
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-nav-auth"
                onClick={() => setIsLoginOpen(true)}
              >
                <Lock size={14} className="icon-auth" />
                Admin
              </button>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="container hero-grid">
            <div>
              <p className="eyebrow">Serving Communities Across India</p>
              <h1>All India Muslim Reservation Porata Samithi (AIMRPS)</h1>
              <p className="hero-text">
                AIMRPS is dedicated to social justice, community empowerment, and reservation advocacy
                through awareness, unity, and grassroots action.
              </p>
              <div className="cta-row">
                <a href="#community" className="btn btn-primary">
                  Explore Community Board
                </a>
              </div>
            </div>
            <aside className="banner-card" aria-label="Multilingual banner">
              <p>Voice for Equality</p>
              <h3>Justice for Every Community</h3>
              <p className="regional-text">Insaf | Samathvam | Nyayam</p>
            </aside>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container section-grid">
            <article>
              <h2>About Us</h2>
              <p>
                AIMRPS works to uplift underrepresented communities by building awareness, advocating
                constitutional rights, and supporting inclusive social progress.
              </p>
            </article>

            <article className="founder-card">
              <h3>Founder</h3>
              <p className="founder-name">Dr. Shaik Islamuddin</p>
              <p className="founder-role">Founder President</p>
            </article>
          </div>

          <div className="container mission-grid">
            <article className="info-card">
              <h3>Mission</h3>
              <p>
                To safeguard reservation rights, create social awareness, and support communities
                through structured advocacy, education, and collective participation.
              </p>
            </article>
            <article className="info-card">
              <h3>Vision</h3>
              <p>
                A just and equitable society where every community has access to equal opportunities,
                dignity, and meaningful representation.
              </p>
            </article>
          </div>
        </section>

        <section id="services" className="section services">
          <div className="container">
            <h2>Services & Activities</h2>
            <div className="services-grid">
              {services.map(({ icon: Icon, title, description }) => (
                <article key={title} className="service-card">
                  <Icon size={22} />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* --- COMMUNITY BOARD SECTION --- */}
        <section id="community" className="section community-board">
          <div className="container">
            <div className="section-header-row">
              <div>
                <h2>Community Board & News</h2>
                <p className="section-subtitle">
                  Stay updated with latest announcements, news, and voice your thoughts through comments and reviews.
                </p>
              </div>
              
              {/* Admin Create Button */}
              {adminToken && (
                <button
                  type="button"
                  className="btn btn-primary btn-icon-text"
                  onClick={handleCreatePost}
                >
                  <Plus size={16} />
                  Create Post
                </button>
              )}
            </div>

            {loadingPosts ? (
              <div className="loading-state">
                <Loader2 size={32} className="spinner" />
                <p>Retrieving community board...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state">
                <p>No community updates posted yet.</p>
                {adminToken && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCreatePost}
                  >
                    Post First Update
                  </button>
                )}
              </div>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    isAdmin={!!adminToken}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                    onViewDetails={handleViewDetails}
                    onImageClick={handleImageClick}
                    onLike={handleLikePost}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="contact" className="section">
          <div className="container contact-grid">
            <article>
              <h2>Contact</h2>
              <p className="contact-line">
                <Phone size={18} />
                <span>85550 19322</span>
              </p>
              <p className="contact-line">
                <Mail size={18} />
                <span>dr.islamuddin12@gmail.com</span>
              </p>
              <p className="contact-line address">
                <MapPin size={18} />
                <span>
                  11-6-653/A, Flat No. 102, 1st Floor, Opp. Metropolitan Criminal Court, Red Hills,
                  Hyderabad - 500004, Telangana
                </span>
              </p>
            </article>

            <form className="contact-form" onSubmit={handleSubmit}>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Write your message"
                value={formData.message}
                onChange={handleInputChange}
                required
              />

              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <p>Follow us: Facebook | Instagram | YouTube</p>
          <p>
            Copyright {new Date().getFullYear()} AIMRPS. All rights reserved.
          </p>
        </div>
      </footer>

      {/* --- MODAL DIALOGS --- */}
      
      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(token) => setAdminToken(token)}
        apiUrl={API_URL}
      />

      {/* Create / Edit Post Modal */}
      <PostForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => {
          fetchPosts();
          setIsFormOpen(false);
        }}
        editingPost={editingPost}
        token={adminToken}
        apiUrl={API_URL}
      />

      {/* Detailed Post View with comments & reviews */}
      <PostDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          fetchPosts(); // Refresh counts on close
        }}
        post={selectedPost}
        isAdmin={!!adminToken}
        apiUrl={API_URL}
        onImageClick={handleImageClick}
      />

      {/* Lightbox Modal for full screen image viewing */}
      {lightboxImage && (
        <div className="lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setLightboxImage(null)}
            aria-label="Close image preview"
          >
            <X size={28} />
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={lightboxImage} alt="Full view" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;