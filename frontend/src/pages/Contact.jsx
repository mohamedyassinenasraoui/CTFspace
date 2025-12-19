import { useState } from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaCode, FaGraduationCap } from 'react-icons/fa';
import './Contact.css';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // For now, just show success message
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 5000);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="contact-page">
            <h1>Contact & About</h1>

            {/* About Section */}
            <div className="container about-section">
                <div className="about-header">
                    <div className="about-icon">
                        <FaGraduationCap />
                    </div>
                    <h2>About This Project</h2>
                </div>

                <div className="about-content">
                    <div className="about-card">
                        <h3>👨‍🎓 Development Team</h3>
                        <div className="developers-list">
                            <div className="developer-item">
                                <p className="developer-name">Mohamed Yassine Nasraoui</p>
                                <p className="developer-role">Full-Stack Developer</p>
                                <a
                                    href="https://github.com/mohamedyassinenasraoui"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="developer-github"
                                >
                                    @mohamedyassinenasraoui
                                </a>
                            </div>
                            <div className="developer-item">
                                <p className="developer-name">Farouk</p>
                                <p className="developer-role">Full-Stack Developer</p>
                                <a
                                    href="https://github.com/farouk-bi"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="developer-github"
                                >
                                    @farouk-bi
                                </a>
                            </div>
                        </div>

                    </div>

                    <div className="about-card">
                        <h3>🎯 Project Mission</h3>
                        <p>
                            This CTF (Capture The Flag) platform is designed to provide an interactive
                            learning environment for cybersecurity enthusiasts. It combines educational
                            content, practical challenges, and community features to help users develop
                            their security skills.

                            <p>
                                Computer science students specialized in cybersecurity, this project reflects our journey in full-stack development.
                                Through building this platform, we applied what we
                                learned in web technologies, backend development, authentication,
                                and security concepts by designing a practical,
                                hands-on environment focused on Capture The Flag challenges and real-world security scenarios.
                            </p>
                        </p>
                    </div>

                    <div className="about-card">
                        <h3>💻 Technology Stack</h3>
                        <div className="tech-stack">
                            <span className="tech-badge">React</span>
                            <span className="tech-badge">Node.js</span>
                            <span className="tech-badge">Express</span>
                            <span className="tech-badge">MongoDB</span>
                            <span className="tech-badge">Socket.IO</span>
                            <span className="tech-badge">JWT</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Links Section */}
            <div className="container links-section">
                <h2>Connect & Explore</h2>
                <div className="links-grid">
                    <a
                        href="https://github.com/mohamedyassinenasraoui"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-card github"
                    >
                        <FaGithub className="link-icon" />
                        <div className="link-content">
                            <h3>GitHub Profile</h3>
                            <p>@mohamedyassinenasraoui</p>
                            <span className="link-arrow">→</span>
                        </div>
                    </a>

                    <a
                        href="https://github.com/mohamedyassinenasraoui/CTFspace"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-card repository"
                    >
                        <FaCode className="link-icon" />
                        <div className="link-content">
                            <h3>Project Repository</h3>
                            <p>CTFspace - Source Code</p>
                            <span className="link-arrow">→</span>
                        </div>
                    </a>

                    <a
                        href="https://github.com/farouk-bi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-card github"
                    >
                        <FaGithub className="link-icon" />
                        <div className="link-content">
                            <h3>Farouk's GitHub</h3>
                            <p>@farouk-bi</p>
                            <span className="link-arrow">→</span>
                        </div>
                    </a>

                    <a
                        href="mailto:medyassine.nasraoui@gmail.com"
                        className="link-card email"
                    >
                        <FaEnvelope className="link-icon" />
                        <div className="link-content">
                            <h3>Email</h3>
                            <p>Get in touch via email</p>
                            <span className="link-arrow">→</span>
                        </div>
                    </a>

                    <a
                        href="https://linkedin.com/in/mohamedyassinenasraoui"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-card linkedin"
                    >
                        <FaLinkedin className="link-icon" />
                        <div className="link-content">
                            <h3>LinkedIn</h3>
                            <p>Professional Network</p>
                            <span className="link-arrow">→</span>
                        </div>
                    </a>
                </div>
            </div>

            {/* Contact Form */}
            <div className="container contact-form-section">
                <h2>Send a Message</h2>
                <p className="form-description">
                    Have questions, suggestions, or want to collaborate? Feel free to reach out!
                </p>

                {submitted && (
                    <div className="alert alert-success">
                        ✓ Thank you for your message! I'll get back to you soon.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="What is this about?"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Your message here..."
                            rows="6"
                            required
                        ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary btn-large">
                        Send Message
                    </button>
                </form>
            </div>

            {/* Features Section */}
            <div className="container features-section">
                <h2>Platform Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>CTF Challenges</h3>
                        <p>Hands-on security challenges covering web, crypto, forensics, and more</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">📚</div>
                        <h3>Learning Resources</h3>
                        <p>Comprehensive tutorials and blog posts on cybersecurity topics</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Team Collaboration</h3>
                        <p>Form teams, compete together, and climb the leaderboard</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🏆</div>
                        <h3>Leaderboards</h3>
                        <p>Track your progress and compete with other security enthusiasts</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">🔒</div>
                        <h3>Hidden Flags</h3>
                        <p>Discover secret flags throughout the platform for bonus points</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Community</h3>
                        <p>Engage with other learners through comments and reviews</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
