# Hidden Flags Challenge Guide

## 🎯 Overview

The platform now includes **11 hidden flags** scattered throughout the codebase! These are educational CTF-style challenges that teach users about web security, developer tools, and reconnaissance techniques.

## 🔍 How to Find Flags

### Beginner Flags (10-15 points each)

1. **HTML Comment Flag** - `FLAG{view-source-is-your-friend}`
   - **Location**: HTML comment in page source
   - **How to find**: Right-click → "View Page Source" or press Ctrl+U
   - **Hint**: "Sometimes the truth hides behind the curtains of the page…"

2. **CSS Comment Flag** - `FLAG{style_and_substance}`
   - **Location**: CSS file comment
   - **How to find**: Check `src/index.css` file
   - **Hint**: "Check the stylesheet files"

3. **Console Log Flag** - `FLAG{look_in_the_console}`
   - **Location**: Browser console
   - **How to find**: Press F12 → Console tab
   - **Hint**: "Open Developer Tools and check the Console tab"

4. **LocalStorage Flag** - `FLAG{localstorage_looter}`
   - **Location**: Browser localStorage
   - **How to find**: F12 → Application tab → Local Storage
   - **Hint**: "Check Application/Storage tab in Developer Tools"

5. **Robots.txt Flag** - `FLAG{dont_list_secrets}`
   - **Location**: `/robots.txt` file
   - **How to find**: Navigate to `http://localhost:5173/robots.txt`
   - **Hint**: "Check the robots.txt file in the root directory"

6. **API Response Flag** - `FLAG{inspect_network_requests}`
   - **Location**: Network request response
   - **How to find**: F12 → Network tab → Login → Check response
   - **Hint**: "Inspect network requests in Developer Tools"

7. **Title Flag** - `FLAG{title_inspection}`
   - **Location**: Document title
   - **How to find**: Check browser tab title or page source
   - **Hint**: "Check the page title in the browser tab or page source"

### Intermediate Flags (15-20 points each)

8. **Hidden Element Flag** - `FLAG{invisible_but_here}`
   - **Location**: Hidden HTML element
   - **How to find**: F12 → Elements tab → Search for `display:none`
   - **Hint**: "Look for elements with display:none"

9. **Base64 Flag** - `FLAG{Base64_for_the_win}`
   - **Location**: Base64 encoded text
   - **How to find**: Decode: `RkxBR3tCYXNlNjRfZm9yX3RoZV93aW59`
   - **Hint**: "Decode: RkxBR3tCYXNlNjRfZm9yX3RoZV93aW59"
   - **Decode at**: https://www.base64decode.org/

10. **Window Object Flag** - `FLAG{window_object_inspection}`
    - **Location**: Window object property
    - **How to find**: F12 → Console → Type `window.__hiddenFlag`
    - **Hint**: "Check window.__hiddenFlag in console"

### Advanced Flags (25 points each)

11. **JWT Token Flag** - `FLAG{jwt_recon}`
    - **Location**: JWT token payload
    - **How to find**: 
      1. Login to get a JWT token
      2. F12 → Application → Local Storage → Find `accessToken`
      3. Copy token and decode at https://jwt.io/
      4. Look in the payload for the `flag` field
    - **Hint**: "Decode your JWT token and inspect the payload"

12. **WebSocket Flag** - `FLAG{realtime_recon}`
    - **Location**: WebSocket message
    - **How to find**: 
      1. F12 → Network tab → WS (WebSocket) filter
      2. Connect to the platform
      3. Look for secret messages
    - **Hint**: "Check WebSocket messages in Network tab"

## 📍 Where Flags Are Located

### Frontend Locations:
- `frontend/index.html` - HTML comment
- `frontend/src/index.css` - CSS comment
- `frontend/src/main.jsx` - Console log, localStorage
- `frontend/src/components/HiddenFlags.jsx` - Hidden elements, base64
- `frontend/public/robots.txt` - Robots.txt flag

### Backend Locations:
- `backend/routes/auth.js` - JWT token flag, API response flag
- `backend/socket/socket.js` - WebSocket flag

## 🎮 How to Submit Flags

1. **Navigate to Hidden Flags page**: `/hidden-flags`
2. **Enter the flag**: Format is `FLAG{...}`
3. **Submit**: Points are awarded to your team
4. **Track progress**: See which flags you've found

## 💡 Tips for Finding Flags

- **Always check the source**: Right-click → View Page Source
- **Use Developer Tools**: F12 is your best friend
- **Check all tabs**: Console, Network, Application, Elements
- **Inspect network requests**: Look at API responses
- **Check storage**: localStorage, sessionStorage, cookies
- **Decode encoded data**: Base64, JWT tokens
- **Look for hidden elements**: Elements with `display:none`

## 🏆 Scoring

- **Beginner flags**: 10-15 points each
- **Intermediate flags**: 15-20 points each
- **Advanced flags**: 25 points each
- **Total possible**: ~200+ points

## 🔧 Developer Notes

Flags are initialized automatically when the server starts. Check `backend/scripts/initializeHiddenFlags.js` to see all flags.

To add more flags, edit the `hiddenFlags` array in that file and restart the server.

## 🎓 Educational Value

These flags teach:
- HTML/CSS inspection
- JavaScript debugging
- Browser developer tools
- Network analysis
- Token inspection
- WebSocket communication
- Encoding/decoding
- Web security basics

Happy hunting! 🔍

