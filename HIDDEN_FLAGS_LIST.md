# Complete List of Hidden Flags

## ✅ Implemented Flags (12 Total)

### 🟢 Beginner Flags (10-15 points)

1. **FLAG{view-source-is-your-friend}** - 10 pts
   - HTML comment in `frontend/index.html`
   - View page source (Ctrl+U)

2. **FLAG{style_and_substance}** - 10 pts
   - CSS comment in `frontend/src/index.css`
   - Check stylesheet files

3. **FLAG{look_in_the_console}** - 10 pts
   - Console log in `frontend/src/main.jsx`
   - F12 → Console tab

4. **FLAG{localstorage_looter}** - 10 pts
   - Stored in localStorage
   - F12 → Application → Local Storage

5. **FLAG{dont_list_secrets}** - 10 pts
   - In `/robots.txt` file
   - Navigate to `http://localhost:5173/robots.txt`

6. **FLAG{inspect_network_requests}** - 15 pts
   - API response field (development mode)
   - F12 → Network → Login request → Check response

7. **FLAG{title_inspection}** - 10 pts
   - In document title
   - Check browser tab or page source

### 🟡 Intermediate Flags (15-20 points)

8. **FLAG{invisible_but_here}** - 15 pts
   - Hidden HTML element with `display:none`
   - F12 → Elements → Search for hidden elements

9. **FLAG{Base64_for_the_win}** - 20 pts
   - Base64 encoded: `RkxBR3tCYXNlNjRfZm9yX3RoZV93aW59`
   - Decode at https://www.base64decode.org/

10. **FLAG{window_object_inspection}** - 15 pts
    - Window object property
    - Console: `window.__hiddenFlag`

### 🔵 Advanced Flags (25 points)

11. **FLAG{jwt_recon}** - 25 pts
    - JWT token payload (development mode only)
    - Steps:
      1. Login to get JWT
      2. F12 → Application → Local Storage → `accessToken`
      3. Copy token
      4. Decode at https://jwt.io/
      5. Look for `flag` field in payload

12. **FLAG{realtime_recon}** - 25 pts
    - WebSocket message
    - F12 → Network → WS filter → Look for secret messages

## 📍 File Locations

### Frontend:
- `frontend/index.html` - HTML comment flag
- `frontend/src/index.css` - CSS comment flag
- `frontend/src/main.jsx` - Console log, localStorage, window object
- `frontend/src/components/HiddenFlags.jsx` - Hidden elements, base64
- `frontend/public/robots.txt` - Robots.txt flag

### Backend:
- `backend/routes/auth.js` - JWT flag, API response flag
- `backend/socket/socket.js` - WebSocket flag

## 🎮 How to Use

1. **Find flags** using developer tools
2. **Submit at** `/hidden-flags` page
3. **Earn points** for your team
4. **Track progress** on the same page

## 💡 Quick Tips

- Press **F12** to open Developer Tools
- Check **Console**, **Network**, **Application** tabs
- **View Source** (Ctrl+U) for HTML comments
- **Decode** base64 and JWT tokens online
- Look for **hidden elements** in Elements tab

All flags are automatically initialized when the server starts!

