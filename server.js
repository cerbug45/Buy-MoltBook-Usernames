const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'analytics.json');

// Initialize analytics file if not exists
function initAnalytics() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({
            views: {},
            clicks: {},
            totalViews: 0,
            totalClicks: 0,
            createdAt: new Date().toISOString()
        }, null, 2));
    }
}

// Load analytics data
function loadAnalytics() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        return { views: {}, clicks: {}, totalViews: 0, totalClicks: 0, createdAt: new Date().toISOString() };
    }
}

// Save analytics data
function saveAnalytics(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Parse request body
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on('error', reject);
    });
}

// CORS headers
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders());
        res.end();
        return;
    }

    // API Routes
    if (pathname.startsWith('/api/')) {
        Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

        try {
            // GET /api/analytics - Get all analytics
            if (pathname === '/api/analytics' && req.method === 'GET') {
                const data = loadAnalytics();
                res.writeHead(200);
                res.end(JSON.stringify(data));
                return;
            }

            // POST /api/track - Track view/click
            if (pathname === '/api/track' && req.method === 'POST') {
                const body = await parseBody(req);
                const { username, action } = body;

                if (!username || !action) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'username and action required' }));
                    return;
                }

                const analytics = loadAnalytics();

                if (action === 'view') {
                    analytics.views[username] = (analytics.views[username] || 0) + 1;
                    analytics.totalViews++;
                } else if (action === 'click') {
                    analytics.clicks[username] = (analytics.clicks[username] || 0) + 1;
                    analytics.totalClicks++;
                }

                saveAnalytics(analytics);

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    username,
                    action,
                    views: analytics.views[username] || 0,
                    clicks: analytics.clicks[username] || 0
                }));
                return;
            }

            // GET /api/trending - Get top 10 trending usernames
            if (pathname === '/api/trending' && req.method === 'GET') {
                const analytics = loadAnalytics();
                const trending = Object.entries(analytics.clicks)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([username, clicks]) => ({ username, clicks }));

                res.writeHead(200);
                res.end(JSON.stringify(trending));
                return;
            }

            // GET /api/stats - Get summary stats
            if (pathname === '/api/stats' && req.method === 'GET') {
                const analytics = loadAnalytics();
                const usernames = Object.keys(analytics.views);
                
                res.writeHead(200);
                res.end(JSON.stringify({
                    totalUsernames: usernames.length,
                    totalViews: analytics.totalViews,
                    totalClicks: analytics.totalClicks,
                    conversionRate: analytics.totalViews > 0 
                        ? ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(2) 
                        : 0,
                    topUsername: Object.entries(analytics.clicks)
                        .sort(([, a], [, b]) => b - a)[0]?.[0] || null
                }));
                return;
            }

            // 404 for unknown routes
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Not found' }));

        } catch (error) {
            console.error('API Error:', error);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        return;
    }

    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const ext = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
            res.end(content);
        }
    });
});

initAnalytics();
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Analytics: http://localhost:${PORT}/api/analytics`);
    console.log(`📈 Stats: http://localhost:${PORT}/api/stats`);
    console.log(`🔥 Trending: http://localhost:${PORT}/api/trending`);
});
