import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/Blog.js';
import User from '../models/User.js';

dotenv.config();

const sampleBlogs = [
    {
        title: "Understanding SQL Injection: A Beginner's Guide",
        excerpt: "Learn how SQL injection attacks work and how to protect your applications from this common vulnerability.",
        category: "tutorials",
        tags: ["sql-injection", "web-security", "owasp", "beginner"],
        content: `# Understanding SQL Injection

SQL Injection is one of the most common and dangerous web application vulnerabilities. In this tutorial, we'll explore what SQL injection is, how it works, and most importantly, how to prevent it.

## What is SQL Injection?

SQL Injection (SQLi) is a code injection technique that exploits security vulnerabilities in an application's database layer. Attackers can insert malicious SQL statements into entry fields, potentially gaining unauthorized access to sensitive data.

## How Does It Work?

Consider this vulnerable login query:
\`\`\`sql
SELECT * FROM users WHERE username = '$username' AND password = '$password'
\`\`\`

An attacker could input:
- Username: \`admin' --\`
- Password: (anything)

This transforms the query to:
\`\`\`sql
SELECT * FROM users WHERE username = 'admin' --' AND password = ''
\`\`\`

The \`--\` comments out the rest of the query, bypassing authentication!

## Prevention Techniques

### 1. Use Prepared Statements
\`\`\`javascript
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.execute(query, [username, password]);
\`\`\`

### 2. Input Validation
Always validate and sanitize user input before using it in queries.

### 3. Least Privilege Principle
Database accounts should have minimal necessary permissions.

### 4. Use ORM Libraries
Modern ORMs like Sequelize, TypeORM, or Mongoose handle parameterization automatically.

## Practice Challenge

Try our SQL Injection challenges in the CTF platform to test your skills!

**Remember:** Understanding vulnerabilities is the first step to building secure applications.`,
        published: true
    },
    {
        title: "The Rise of Ransomware: 2024 Threat Landscape",
        excerpt: "Analyzing the latest ransomware trends and how organizations can protect themselves from these evolving threats.",
        category: "threats",
        tags: ["ransomware", "malware", "threat-intelligence", "cybercrime"],
        content: `# The Rise of Ransomware: 2024 Threat Landscape

Ransomware attacks have evolved from simple file encryption to sophisticated multi-stage operations. Let's examine the current threat landscape.

## Key Trends in 2024

### 1. Double Extortion Tactics
Attackers now:
- Encrypt data
- Exfiltrate sensitive information
- Threaten to leak data publicly

### 2. Ransomware-as-a-Service (RaaS)
The commoditization of ransomware has lowered the barrier to entry for cybercriminals.

### 3. Targeting Critical Infrastructure
Healthcare, energy, and government sectors face increased targeting.

## Notable Ransomware Families

- **LockBit 3.0**: Advanced evasion techniques
- **BlackCat (ALPHV)**: Rust-based, cross-platform
- **Royal**: Emerging threat with custom encryption

## Defense Strategies

### Immediate Actions
1. **Regular Backups**: 3-2-1 backup rule
2. **Patch Management**: Keep systems updated
3. **Network Segmentation**: Limit lateral movement
4. **Email Security**: Block phishing attempts

### Advanced Measures
- Zero Trust Architecture
- Endpoint Detection and Response (EDR)
- Security Awareness Training
- Incident Response Planning

## Conclusion

Ransomware remains one of the most significant cybersecurity threats. Proactive defense and preparation are essential.

*Stay vigilant, stay secure.*`,
        published: true
    },
    {
        title: "XSS Attacks Explained: Types and Mitigation",
        excerpt: "A comprehensive guide to Cross-Site Scripting vulnerabilities, their types, and effective prevention methods.",
        category: "tutorials",
        tags: ["xss", "web-security", "javascript", "owasp"],
        content: `# XSS Attacks Explained: Types and Mitigation

Cross-Site Scripting (XSS) is a client-side code injection attack where malicious scripts are injected into trusted websites.

## Types of XSS

### 1. Reflected XSS
The malicious script comes from the current HTTP request.

**Example:**
\`\`\`
https://example.com/search?q=<script>alert('XSS')</script>
\`\`\`

### 2. Stored XSS
The malicious script is permanently stored on the target server (database, forum, comment field).

### 3. DOM-based XSS
The vulnerability exists in client-side code rather than server-side.

## Real-World Impact

XSS can lead to:
- Session hijacking
- Credential theft
- Defacement
- Malware distribution
- Phishing attacks

## Prevention Techniques

### 1. Input Validation
\`\`\`javascript
function sanitizeInput(input) {
  return input.replace(/[<>\"']/g, '');
}
\`\`\`

### 2. Output Encoding
\`\`\`javascript
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
\`\`\`

### 3. Content Security Policy (CSP)
\`\`\`html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
\`\`\`

### 4. HTTPOnly Cookies
Prevent JavaScript from accessing session cookies.

## Testing for XSS

Common payloads:
- \`<script>alert('XSS')</script>\`
- \`<img src=x onerror=alert('XSS')>\`
- \`<svg/onload=alert('XSS')>\`

## Conclusion

XSS remains prevalent despite being well-understood. Always validate input, encode output, and implement CSP headers.`,
        published: true
    },
    {
        title: "Zero-Day Vulnerabilities: The Race Against Time",
        excerpt: "Exploring the world of zero-day exploits, their discovery, and the critical importance of rapid response.",
        category: "analysis",
        tags: ["zero-day", "vulnerability-research", "exploit", "security-research"],
        content: `# Zero-Day Vulnerabilities: The Race Against Time

A zero-day vulnerability is a software flaw unknown to the vendor, giving defenders "zero days" to fix it before exploitation.

## The Zero-Day Lifecycle

1. **Discovery**: Researcher or attacker finds the vulnerability
2. **Exploitation**: Exploit code is developed
3. **Disclosure**: Vulnerability is reported (or sold)
4. **Patch Development**: Vendor creates a fix
5. **Deployment**: Users apply the patch

## Recent Notable Zero-Days

### Log4Shell (CVE-2021-44228)
- **Impact**: Critical RCE in Apache Log4j
- **Affected**: Millions of applications worldwide
- **CVSS Score**: 10.0

### ProxyLogon (CVE-2021-26855)
- **Target**: Microsoft Exchange Server
- **Impact**: Full system compromise
- **Exploitation**: Widespread in the wild

## The Zero-Day Market

### White Market
- Responsible disclosure to vendors
- Bug bounty programs
- Coordinated vulnerability disclosure

### Gray Market
- Government agencies
- Defense contractors
- Prices: $100K - $2M+

### Black Market
- Cybercriminal groups
- Nation-state actors
- Unregulated, highest prices

## Detection Strategies

### Behavioral Analysis
Monitor for unusual system behavior:
- Unexpected network connections
- Privilege escalation attempts
- Abnormal process execution

### Threat Intelligence
- Subscribe to security feeds
- Monitor vendor advisories
- Participate in information sharing

### Defense in Depth
- Network segmentation
- Least privilege access
- Application whitelisting
- EDR solutions

## Responsible Disclosure

If you discover a vulnerability:
1. Document the issue thoroughly
2. Contact the vendor's security team
3. Allow reasonable time for patching (90 days standard)
4. Coordinate public disclosure

## Conclusion

Zero-day vulnerabilities represent the cutting edge of cybersecurity threats. Organizations must maintain robust security postures and rapid response capabilities.

*The best defense is preparation.*`,
        published: true
    },
    {
        title: "Building Secure APIs: Best Practices for 2024",
        excerpt: "Essential security practices for designing and implementing secure RESTful APIs in modern applications.",
        category: "tutorials",
        tags: ["api-security", "rest", "authentication", "best-practices"],
        content: `# Building Secure APIs: Best Practices for 2024

APIs are the backbone of modern applications, but they're also prime targets for attackers. Let's explore essential security practices.

## Authentication & Authorization

### 1. Use OAuth 2.0 / OpenID Connect
\`\`\`javascript
// Example: JWT-based authentication
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
\`\`\`

### 2. Implement Rate Limiting
\`\`\`javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
\`\`\`

## Input Validation

### Never Trust User Input
\`\`\`javascript
const { body, validationResult } = require('express-validator');

app.post('/api/users',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
\`\`\`

## Security Headers

### Essential Headers
\`\`\`javascript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});
\`\`\`

## HTTPS Everywhere

Always use HTTPS in production:
- Encrypt data in transit
- Prevent man-in-the-middle attacks
- Enable HTTP/2 for better performance

## API Versioning

\`\`\`javascript
// Good: Version in URL
app.use('/api/v1/users', usersRouterV1);
app.use('/api/v2/users', usersRouterV2);
\`\`\`

## Error Handling

### Don't Leak Information
\`\`\`javascript
// Bad
res.status(500).json({ error: err.stack });

// Good
res.status(500).json({ error: 'Internal server error' });
// Log detailed errors server-side
logger.error(err);
\`\`\`

## CORS Configuration

\`\`\`javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  optionsSuccessStatus: 200
}));
\`\`\`

## Logging & Monitoring

- Log all authentication attempts
- Monitor for suspicious patterns
- Set up alerts for anomalies
- Regular security audits

## Conclusion

API security is not a one-time task but an ongoing process. Implement these practices and stay updated with emerging threats.

**Remember:** Security is only as strong as its weakest link.`,
        published: true
    },
    {
        title: "Phishing in 2024: Advanced Tactics and Detection",
        excerpt: "Understanding modern phishing techniques and how to recognize and prevent these social engineering attacks.",
        category: "threats",
        tags: ["phishing", "social-engineering", "email-security", "awareness"],
        content: `# Phishing in 2024: Advanced Tactics and Detection

Phishing remains one of the most effective attack vectors, with attackers constantly evolving their techniques.

## Evolution of Phishing

### Traditional Phishing
- Mass email campaigns
- Generic messages
- Obvious red flags

### Modern Phishing
- Highly targeted (spear phishing)
- Personalized content
- Legitimate-looking domains
- Multi-channel attacks (email, SMS, voice)

## Advanced Techniques

### 1. Business Email Compromise (BEC)
Attackers impersonate executives to authorize fraudulent transactions.

**Example:**
\`\`\`
From: CEO@company.com (spoofed)
Subject: Urgent Wire Transfer Needed

We need to complete this acquisition ASAP.
Please wire $50,000 to the following account...
\`\`\`

### 2. Clone Phishing
Legitimate emails are copied and modified with malicious links.

### 3. Whaling
Targeting high-profile individuals (C-suite executives).

### 4. Vishing (Voice Phishing)
Phone calls impersonating IT support or banks.

### 5. Smishing (SMS Phishing)
Text messages with malicious links.

## Red Flags to Watch For

### Email Indicators
- ✗ Urgent language ("Act now!", "Verify immediately")
- ✗ Suspicious sender addresses
- ✗ Generic greetings ("Dear Customer")
- ✗ Spelling and grammar errors
- ✗ Unexpected attachments
- ✗ Mismatched URLs (hover to check)

### URL Analysis
\`\`\`
Legitimate: https://paypal.com
Phishing:   https://paypa1.com (1 instead of l)
Phishing:   https://paypal-secure.com
Phishing:   https://paypal.verification-required.com
\`\`\`

## Technical Defenses

### 1. Email Authentication
- **SPF**: Sender Policy Framework
- **DKIM**: DomainKeys Identified Mail
- **DMARC**: Domain-based Message Authentication

### 2. Link Analysis Tools
\`\`\`javascript
// Check URL reputation
async function checkURL(url) {
  // Use services like VirusTotal, Google Safe Browsing
  const response = await fetch(\`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=\${API_KEY}\`, {
    method: 'POST',
    body: JSON.stringify({
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }]
      }
    })
  });
  return response.json();
}
\`\`\`

### 3. Security Awareness Training
Regular training sessions covering:
- Latest phishing tactics
- Real-world examples
- Reporting procedures
- Simulated phishing tests

## What to Do If You Click

1. **Don't Panic**
2. **Disconnect from network** (if possible)
3. **Change passwords** immediately
4. **Report to IT/Security team**
5. **Monitor accounts** for suspicious activity
6. **Enable MFA** if not already active

## Organizational Defenses

### Technical Controls
- Email filtering and scanning
- Web filtering
- Endpoint protection
- Multi-factor authentication (MFA)

### Process Controls
- Verification procedures for financial transactions
- Out-of-band confirmation for sensitive requests
- Regular security audits

### People Controls
- Security awareness training
- Phishing simulation exercises
- Clear reporting channels
- Incident response procedures

## Reporting Phishing

### In Organizations
Report to your security team immediately.

### Consumer
- **US**: reportphishing@apwg.org
- **UK**: report@phishing.gov.uk
- Forward to the impersonated company

## Conclusion

Phishing attacks exploit human psychology more than technical vulnerabilities. Stay vigilant, verify suspicious requests, and when in doubt, contact the sender through a known, trusted channel.

**Remember:** Think before you click!`,
        published: true
    }
];

async function seedBlogs() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf');
        console.log('Connected to MongoDB');

        // Find an admin user to be the author
        let admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin user found. Creating one...');
            const bcrypt = await import('bcryptjs');
            const passwordHash = await bcrypt.default.hash('admin123', 10);

            admin = await User.create({
                username: 'Admin',
                email: 'admin@ctf.local',
                passwordHash,
                role: 'admin'
            });
            console.log('Admin user created');
        }

        // Clear existing blogs (optional - comment out if you want to keep existing)
        // await Blog.deleteMany({});
        // console.log('Cleared existing blogs');

        // Create blogs
        for (const blogData of sampleBlogs) {
            // Generate slug from title
            const slug = blogData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const existingBlog = await Blog.findOne({ slug });

            if (!existingBlog) {
                await Blog.create({
                    ...blogData,
                    slug,
                    author: admin._id,
                    publishedAt: new Date()
                });
                console.log(`✓ Created: ${blogData.title}`);
            } else {
                console.log(`- Skipped (exists): ${blogData.title}`);
            }
        }


        console.log('\n✅ Blog seeding completed successfully!');
        console.log(`Total blogs in database: ${await Blog.countDocuments()}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding blogs:', error);
        process.exit(1);
    }
}

seedBlogs();
