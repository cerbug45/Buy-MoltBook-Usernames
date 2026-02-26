# Moltbook Premium Usernames

Premium Moltbook usernames for sale with real-time analytics tracking.

## 🚀 Features

- **Real-time Analytics**: Track views and clicks for each username
- **Backend API**: Node.js server for persistent analytics storage
- **Trending Section**: Top 10 most-clicked usernames
- **Advanced Filters**: Filter by length, type (letters/numbers/special chars)
- **Search**: Instant search across all usernames
- **Responsive Design**: Works on desktop and mobile
- **LocalStorage Fallback**: Works even without backend server

## 📊 Analytics API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get all analytics data |
| GET | `/api/stats` | Get summary statistics |
| GET | `/api/trending` | Get top 10 trending usernames |
| POST | `/api/track` | Track a view or click |

### Track Request

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"username": "Pyke", "action": "click"}'
```

### Response

```json
{
  "success": true,
  "username": "Pyke",
  "action": "click",
  "views": 42,
  "clicks": 15
}
```

## 🛠️ Setup

### Install Dependencies

```bash
npm install
```

### Start Server

```bash
node server.js
```

Server will run on `http://localhost:3000`

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |

## 📁 File Structure

```
.
├── index.html          # Main frontend
├── usernames.json      # Username database
├── server.js           # Backend API server
├── analytics.json      # Analytics data (auto-generated)
└── README.md           # This file
```

## 🎯 Usage

1. Open `http://localhost:3000` in browser
2. Browse usernames or use search/filters
3. Click on a username to copy to clipboard
4. View analytics at `http://localhost:3000/api/stats`

## 📈 Analytics Dashboard

Access real-time stats:

- **All Analytics**: `http://localhost:3000/api/analytics`
- **Summary Stats**: `http://localhost:3000/api/stats`
- **Trending**: `http://localhost:3000/api/trending`

## 🔒 Privacy

- Analytics are stored server-side in `analytics.json`
- No personal data is collected
- IP addresses are not logged
- Session-based view tracking (one view per session per username)

## 📝 License

MIT License - See LICENSE file for details

---

**Contact**: [@whalsapp](https://t.me/whalsapp) on Telegram
