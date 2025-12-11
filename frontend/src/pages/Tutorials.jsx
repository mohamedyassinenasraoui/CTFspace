import '../App.css';

function Tutorials() {
  return (
    <div>
      <h1>CTF Tutorials & Learning Resources</h1>

      <div className="container">
        <h2>Welcome to CTF Learning</h2>
        <p>
          This section provides educational content about cybersecurity concepts and tools.
          All examples and labs should be practiced only in isolated, controlled environments.
        </p>
      </div>

      <div className="container">
        <h2>Networking Basics</h2>
        <h3>Understanding IP Addresses</h3>
        <p>
          An IP (Internet Protocol) address is a unique identifier assigned to devices on a network.
          IPv4 addresses consist of four numbers separated by dots (e.g., 192.168.1.1).
        </p>
        <h3>Ports and Services</h3>
        <p>
          Ports are communication endpoints. Common ports include:
        </p>
        <ul>
          <li>Port 80: HTTP (web traffic)</li>
          <li>Port 443: HTTPS (secure web traffic)</li>
          <li>Port 22: SSH (secure shell)</li>
          <li>Port 21: FTP (file transfer)</li>
        </ul>
        <p>
          Understanding ports helps identify what services are running on a system.
        </p>
      </div>

      <div className="container">
        <h2>Network Scanning (Educational)</h2>
        <h3>What is Nmap?</h3>
        <p>
          Nmap (Network Mapper) is a tool used for network discovery and security auditing.
          It can identify hosts, services, and open ports on a network.
        </p>
        <h3>Defensive Use Cases</h3>
        <p>
          Network administrators use scanning tools to:
        </p>
        <ul>
          <li>Audit network security</li>
          <li>Identify unauthorized services</li>
          <li>Verify firewall rules</li>
          <li>Monitor network inventory</li>
        </ul>
        <p>
          <strong>Important:</strong> Only scan networks you own or have explicit permission to scan.
          Unauthorized scanning is illegal in many jurisdictions.
        </p>
      </div>

      <div className="container">
        <h2>Web Application Security</h2>
        <h3>OWASP Top 10</h3>
        <p>
          The OWASP Top 10 is a standard awareness document for web application security risks:
        </p>
        <ol>
          <li>Broken Access Control</li>
          <li>Cryptographic Failures</li>
          <li>Injection (SQL, NoSQL, Command, etc.)</li>
          <li>Insecure Design</li>
          <li>Security Misconfiguration</li>
          <li>Vulnerable Components</li>
          <li>Authentication Failures</li>
          <li>Software and Data Integrity Failures</li>
          <li>Security Logging Failures</li>
          <li>Server-Side Request Forgery</li>
        </ol>
        <h3>SQL Injection Prevention</h3>
        <p>
          SQL injection occurs when user input is improperly sanitized and executed as SQL code.
          <strong>Always use parameterized queries or prepared statements</strong> to prevent this.
        </p>
        <p>
          <strong>Example (Safe):</strong> Using parameterized queries ensures user input is treated as data, not code.
        </p>
      </div>

      <div className="container">
        <h2>Setting Up a Local Practice Lab</h2>
        <h3>Using Docker Compose</h3>
        <p>
          You can practice safely using intentionally vulnerable applications in isolated Docker containers.
        </p>
        <h3>Recommended Practice Platforms</h3>
        <ul>
          <li>
            <strong>TryHackMe:</strong> Legal, guided cybersecurity training platform
          </li>
          <li>
            <strong>HackTheBox:</strong> Legal penetration testing labs
          </li>
          <li>
            <strong>OWASP Juice Shop:</strong> Intentionally vulnerable web application for learning
          </li>
          <li>
            <strong>DVWA (Damn Vulnerable Web App):</strong> Web application with intentional vulnerabilities
          </li>
        </ul>
        <h3>Local Lab Setup</h3>
        <p>
          See the Docker Compose configuration in the project root for setting up a local practice environment.
          Always run vulnerable applications in isolated networks, never expose them to the internet.
        </p>
      </div>

      <div className="container">
        <h2>Secure Coding Practices</h2>
        <h3>Input Validation</h3>
        <p>
          Always validate and sanitize user input on both client and server side.
        </p>
        <h3>Authentication & Authorization</h3>
        <p>
          Implement proper authentication (who you are) and authorization (what you can do).
          Use secure password hashing (bcrypt, Argon2) and implement rate limiting.
        </p>
        <h3>Error Handling</h3>
        <p>
          Don't expose sensitive information in error messages. Log errors securely without revealing system details.
        </p>
      </div>

      <div className="container">
        <h2>Ethical Guidelines</h2>
        <ul>
          <li>Only practice on systems you own or have explicit permission to test</li>
          <li>Never attempt to access systems without authorization</li>
          <li>Respect privacy and data protection laws</li>
          <li>Report vulnerabilities responsibly through proper channels</li>
          <li>Use your skills to improve security, not to cause harm</li>
        </ul>
      </div>

      <div className="container">
        <h2>Additional Resources</h2>
        <ul>
          <li>
            <a href="https://owasp.org/" target="_blank" rel="noopener noreferrer">
              OWASP Foundation
            </a>
          </li>
          <li>
            <a href="https://www.tryhackme.com/" target="_blank" rel="noopener noreferrer">
              TryHackMe
            </a>
          </li>
          <li>
            <a href="https://www.hackthebox.com/" target="_blank" rel="noopener noreferrer">
              HackTheBox
            </a>
          </li>
          <li>
            <a href="https://portswigger.net/web-security" target="_blank" rel="noopener noreferrer">
              PortSwigger Web Security Academy
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Tutorials;

