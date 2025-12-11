import mongoose from 'mongoose';
import Challenge from '../models/Challenge.js';
import dotenv from 'dotenv';

dotenv.config();

const hiddenFlags = [
  {
    flagId: 'html-comment-1',
    flag: 'FLAG{view-source-is-your-friend}',
    title: 'HTML Comment Discovery',
    category: 'beginner',
    difficulty: 'easy',
    tags: ['web', 'recon', 'html'],
    location: 'HTML comment in page source',
    description: 'Hi, intrepid investigator! 📄 🔍 You\'ve stumbled upon a web page that seems normal at first glance. But beware! Not everything is as it appears. Sometimes developers leave comments in the source code that reveal hidden secrets. View the page source and uncover the flag hidden in an HTML comment.',
    hints: [
      'Right-click on the page and select "View Page Source"',
      'Look for HTML comments that start with <!-- and end with -->',
      'The flag is in the <head> section of the HTML'
    ],
    author: 'CTF Platform',
    points: 10
  },
  {
    flagId: 'css-comment-1',
    flag: 'FLAG{style_and_substance}',
    title: 'CSS Secrets',
    category: 'beginner',
    difficulty: 'easy',
    tags: ['web', 'css', 'recon'],
    location: 'CSS file comment',
    description: 'Stylesheets aren\'t just for making things look pretty! Sometimes developers hide information in CSS comments. Can you find the flag hidden in the stylesheet?',
    hints: [
      'CSS files are loaded in the <head> section',
      'Look for comments that start with /* and end with */',
      'Check the main CSS file loaded by the application'
    ],
    author: 'CTF Platform',
    points: 10
  },
  {
    flagId: 'console-log-1',
    flag: 'FLAG{look_in_the_console}',
    title: 'Console Secrets',
    category: 'beginner',
    difficulty: 'easy',
    tags: ['web', 'javascript', 'browser'],
    location: 'Browser console log',
    description: 'Developers often use console.log() for debugging. Sometimes they forget to remove important information! Open your browser\'s developer console and see what messages are being logged.',
    hints: [
      'Press F12 to open Developer Tools',
      'Click on the "Console" tab',
      'Look for log messages when the page loads'
    ],
    author: 'CTF Platform',
    points: 10
  },
  {
    flagId: 'localstorage-1',
    flag: 'FLAG{localstorage_looter}',
    title: 'Local Storage Treasure',
    category: 'beginner',
    difficulty: 'easy',
    tags: ['web', 'storage', 'browser'],
    location: 'Browser localStorage',
    description: 'Modern web applications use browser storage to save data. Sometimes sensitive information gets stored there! Can you find what\'s hidden in the browser\'s local storage?',
    hints: [
      'Open Developer Tools (F12)',
      'Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)',
      'Look under "Local Storage" for the current domain'
    ],
    author: 'CTF Platform',
    points: 10
  },
  {
    flagId: 'robots-txt-1',
    flag: 'FLAG{dont_list_secrets}',
    title: 'Robots.txt Revelation',
    category: 'beginner',
    difficulty: 'easy',
    tags: ['web', 'recon', 'forensics'],
    location: '/robots.txt file',
    description: 'The robots.txt file tells search engines what to index. But sometimes developers leave comments or information in this file that they shouldn\'t! Navigate to the robots.txt file and see what secrets it holds.',
    hints: [
      'robots.txt is always in the root directory',
      'Try accessing /robots.txt in your browser',
      'Look for comments in the file (lines starting with #)'
    ],
    author: 'CTF Platform',
    points: 10
  },
  {
    flagId: 'api-response-1',
    flag: 'FLAG{inspect_network_requests}',
    title: 'Network Inspector',
    category: 'beginner',
    difficulty: 'medium',
    tags: ['web', 'network', 'api'],
    location: 'API response in Network tab',
    description: 'When you interact with a web application, it makes requests to the server. These requests and responses often contain more information than what\'s displayed on the page. Log in and inspect the network traffic to find a hidden flag!',
    hints: [
      'Open Developer Tools and go to the "Network" tab',
      'Perform an action that makes a request (like logging in)',
      'Click on the request and check the "Response" tab',
      'Look for fields that aren\'t displayed in the UI'
    ],
    author: 'CTF Platform',
    points: 15
  },
  {
    flagId: 'hidden-element-1',
    flag: 'FLAG{invisible_but_here}',
    title: 'Invisible Element',
    category: 'intermediate',
    difficulty: 'medium',
    tags: ['web', 'html', 'css'],
    location: 'Hidden HTML element',
    description: 'Sometimes elements are hidden using CSS but still present in the DOM. These hidden elements can contain valuable information! Use the Elements inspector to find elements that are hidden from view.',
    hints: [
      'Open Developer Tools and go to the "Elements" tab',
      'Search for elements with style="display:none"',
      'Look for elements positioned off-screen (left: -9999px)',
      'Use Ctrl+F to search for "FLAG" in the Elements tab'
    ],
    author: 'CTF Platform',
    points: 15
  },
  {
    flagId: 'base64-1',
    flag: 'FLAG{Base64_for_the_win}',
    title: 'Base64 Decoder Challenge',
    category: 'intermediate',
    difficulty: 'medium',
    tags: ['crypto', 'encoding', 'web'],
    location: 'Base64 encoded text in footer',
    description: 'Base64 encoding is commonly used to encode binary data as text. Sometimes flags are hidden in base64-encoded strings! Find the encoded string and decode it to reveal the flag. The encoded string is: RkxBR3tCYXNlNjRfZm9yX3RoZV93aW59',
    hints: [
      'Base64 strings often end with = or ==',
      'Use an online decoder like base64decode.org',
      'Or use JavaScript: atob("encoded_string")',
      'The encoded string might be in a hidden element'
    ],
    author: 'CTF Platform',
    points: 20
  },
  {
    flagId: 'window-object-1',
    flag: 'FLAG{window_object_inspection}',
    title: 'Window Object Explorer',
    category: 'intermediate',
    difficulty: 'medium',
    tags: ['javascript', 'browser', 'web'],
    location: 'Window object property',
    description: 'JavaScript\'s window object contains many properties. Sometimes developers attach custom properties to it for debugging or other purposes. Can you find the hidden property in the window object?',
    hints: [
      'Open the browser console (F12)',
      'Type "window" and press Enter to see all properties',
      'Look for properties that start with __ or seem unusual',
      'Try: window.__hiddenFlag'
    ],
    author: 'CTF Platform',
    points: 15
  },
  {
    flagId: 'title-flag-1',
    flag: 'FLAG{title_inspection}',
    title: 'Title Investigation',
    category: 'beginner',
    difficulty: 'easy',
    tags: ['web', 'html', 'recon'],
    location: 'Document title',
    description: 'The page title appears in the browser tab. Sometimes it contains more than just the page name! Check the browser tab or the HTML source to find what\'s hidden in the title.',
    hints: [
      'Look at the browser tab title',
      'Or view the page source and find the <title> tag',
      'The title might contain more than you expect'
    ],
    author: 'CTF Platform',
    points: 10
  },
  {
    flagId: 'jwt-token-1',
    flag: 'FLAG{jwt_recon}',
    title: 'JWT Token Analysis',
    category: 'advanced',
    difficulty: 'hard',
    tags: ['web', 'jwt', 'crypto', 'authentication'],
    location: 'JWT token payload',
    description: 'JSON Web Tokens (JWT) are used for authentication. They consist of three parts separated by dots. The middle part (payload) is base64-encoded JSON that can be decoded. Sometimes developers include additional information in the token payload! Log in, find your JWT token, and decode it to discover the hidden flag.',
    hints: [
      'After logging in, check localStorage for "accessToken"',
      'JWT tokens have three parts: header.payload.signature',
      'Decode the payload at jwt.io',
      'Look for a "flag" field in the decoded payload',
      'Note: This only works in development mode'
    ],
    author: 'CTF Platform',
    points: 25
  },
  {
    flagId: 'websocket-1',
    flag: 'FLAG{realtime_recon}',
    title: 'WebSocket Message Interception',
    category: 'advanced',
    difficulty: 'hard',
    tags: ['web', 'websocket', 'network', 'realtime'],
    location: 'WebSocket message',
    description: 'WebSockets enable real-time communication between client and server. Sometimes servers send messages that aren\'t displayed in the UI. Can you intercept and inspect WebSocket messages to find the hidden flag?',
    hints: [
      'Open Developer Tools → Network tab',
      'Filter by "WS" (WebSocket)',
      'Connect to the platform and look for WebSocket connections',
      'Click on the WebSocket connection and check the "Messages" tab',
      'Look for secret opcodes or hidden messages'
    ],
    author: 'CTF Platform',
    points: 25
  }
];

export async function initializeHiddenFlags() {
  try {
    let created = 0;
    let skipped = 0;

    for (const flagData of hiddenFlags) {
      try {
        // Check if challenge already exists by flag
        const existing = await Challenge.findOne({ flag: flagData.flag });
        
        // Map category
        let category = flagData.category;
        if (['beginner', 'intermediate', 'advanced', 'expert'].includes(category)) {
          if (flagData.tags && flagData.tags.includes('web')) {
            category = 'web';
          } else if (flagData.tags && flagData.tags.includes('crypto')) {
            category = 'crypto';
          } else if (flagData.tags && flagData.tags.includes('forensics')) {
            category = 'forensics';
          } else {
            category = 'misc';
          }
        }

        // Convert hints format
        const hints = flagData.hints.map(hint => ({
          text: hint,
          cost: 0
        }));

        if (!existing) {
          await Challenge.create({
            title: flagData.title,
            description: flagData.description || flagData.location,
            category: category,
            points: flagData.points || 10,
            difficulty: flagData.difficulty || 'easy',
            flag: flagData.flag,
            challengeType: 'hidden',
            visible: true,
            files: [],
            hints: hints,
            tags: flagData.tags || [],
            location: flagData.location,
            author: flagData.author || 'CTF Platform',
            likes: 0,
            likedBy: [],
            solvedCount: 0
          });
          created++;
        } else {
          // Update existing challenge
          await Challenge.findOneAndUpdate(
            { flag: flagData.flag },
            { 
              $set: {
                title: flagData.title,
                difficulty: flagData.difficulty,
                tags: flagData.tags,
                description: flagData.description,
                hints: hints,
                author: flagData.author,
                location: flagData.location,
                category: category
              }
            }
          );
          skipped++;
        }
      } catch (error) {
        console.error(`Error creating challenge ${flagData.flagId}:`, error.message);
      }
    }

    if (created > 0 || skipped > 0) {
      console.log(`Hidden flag challenges: ${created} created, ${skipped} updated`);
    } else {
      console.log('No challenges to create or update');
    }
  } catch (error) {
    console.error('Error initializing hidden flag challenges:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('initializeHiddenFlags')) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf-platform';
  
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log('Connected to MongoDB');
      await initializeHiddenFlags();
      await mongoose.connection.close();
      console.log('Database connection closed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
