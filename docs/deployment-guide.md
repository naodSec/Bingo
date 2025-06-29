# Complete Deployment Guide for Epic Bingo Game

## 🚀 Overview
This guide covers deploying the Epic Bingo Game from development to production, including Telegram bot integration.

## 📋 Prerequisites

### Required Accounts & Services
1. **Firebase Project** (Database & Authentication)
2. **Chapa Account** (Payment Gateway)
3. **Telegram Bot** (Game Notifications)
4. **Hosting Provider** (Netlify, Vercel, or VPS)
5. **Domain Name** (Optional but recommended)

## 🔧 Environment Setup

### 1. Firebase Configuration

#### Create Firebase Project
```bash
# Visit https://console.firebase.google.com/
# Create new project: "epic-bingo-game"
# Enable Authentication (Email/Password)
# Enable Firestore Database
# Enable Storage (for future features)
```

#### Download Service Account Key
```bash
# Go to Project Settings > Service Accounts
# Generate new private key
# Download JSON file
# Rename to: serviceAccountKey.json
```

#### Firestore Security Rules
```javascript
// Copy the rules from firestore.rules file
// Deploy via Firebase Console or CLI
```

### 2. Chapa Payment Gateway

#### Get API Credentials
```bash
# Visit https://developer.chapa.co/
# Create account and verify business
# Get Test Credentials:
CHAPA_SECRET_KEY=CHASECK_TEST-your-test-key
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-your-test-key

# For Production:
CHAPA_SECRET_KEY=CHASECK_LIVE-your-live-key
CHAPA_PUBLIC_KEY=CHAPUBK_LIVE-your-live-key
```

### 3. Telegram Bot Setup

#### Create Bot
```bash
# Message @BotFather on Telegram
# Send: /newbot
# Choose name: Epic Bingo Game Bot
# Choose username: @EpicBingoGameBot
# Save the bot token
```

#### Bot Configuration
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
```

## 🏗️ Backend Deployment

### Option 1: Railway Deployment

#### 1. Prepare Backend
```bash
# Create railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python app.py",
    "healthcheckPath": "/health"
  }
}
```

#### 2. Environment Variables
```bash
# Set in Railway dashboard
CHAPA_SECRET_KEY=your_chapa_secret
CHAPA_PUBLIC_KEY=your_chapa_public
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
TELEGRAM_BOT_TOKEN=your_telegram_token
ENVIRONMENT=production
PORT=5000
```

#### 3. Deploy
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 2: Heroku Deployment

#### 1. Prepare Files
```bash
# Create Procfile
echo "web: python app.py" > Procfile

# Create runtime.txt
echo "python-3.11.0" > runtime.txt
```

#### 2. Deploy
```bash
# Install Heroku CLI
# Login and create app
heroku login
heroku create epic-bingo-backend

# Set environment variables
heroku config:set CHAPA_SECRET_KEY=your_key
heroku config:set FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# Deploy
git add .
git commit -m "Deploy backend"
git push heroku main
```

### Option 3: VPS Deployment

#### 1. Server Setup (Ubuntu 22.04)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip nginx supervisor -y

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Setup
```bash
# Clone repository
git clone https://github.com/yourusername/epic-bingo-game.git
cd epic-bingo-game/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
nano .env
# Add all environment variables
```

#### 3. Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'epic-bingo-backend',
    script: 'app.py',
    interpreter: 'python3',
    cwd: '/path/to/backend',
    env: {
      PORT: 5000,
      ENVIRONMENT: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/epic-bingo
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/epic-bingo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

## 🌐 Frontend Deployment

### Option 1: Netlify Deployment

#### 1. Build Configuration
```bash
# Create netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### 2. Environment Variables
```bash
# Set in Netlify dashboard
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_BACKEND_URL=https://your-backend-url.com
VITE_FRONTEND_URL=https://your-frontend-url.netlify.app
```

#### 3. Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and deploy
netlify login
netlify init
netlify deploy --prod
```

### Option 2: Vercel Deployment

#### 1. Configuration
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://your-backend-url.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 2. Deploy
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🤖 Telegram Bot Integration

### 1. Webhook Setup
```python
# Add to your backend
import requests

def setup_telegram_webhook():
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    webhook_url = f"{os.getenv('BACKEND_URL')}/api/telegram/webhook"
    
    response = requests.post(
        f"https://api.telegram.org/bot{bot_token}/setWebhook",
        json={"url": webhook_url}
    )
    return response.json()
```

### 2. Bot Commands
```python
# Add to backend/app.py
@app.route('/api/telegram/webhook', methods=['POST'])
def telegram_webhook():
    update = request.json
    
    if 'message' in update:
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        
        if text == '/start':
            send_welcome_message(chat_id)
        elif text == '/games':
            send_active_games(chat_id)
        elif text == '/balance':
            send_balance_info(chat_id, message['from']['id'])
    
    return jsonify({'status': 'ok'})

def send_welcome_message(chat_id):
    message = """
🎯 Welcome to Epic Bingo Game!

Commands:
/games - View active games
/balance - Check your balance
/help - Get help

Play now: https://your-domain.com
    """
    
    send_telegram_message(chat_id, message)
```

### 3. Game Notifications
```python
# Integrate with game events
def notify_game_start(game_room):
    if game_room.get('telegramChannelId'):
        message = f"""
🎯 GAME STARTED!
🏆 {game_room['name']}
💰 Prize Pool: {game_room['prizePool']} ETB
👥 Players: {len(game_room['players'])}

Good luck everyone! 🍀
        """
        send_telegram_message(game_room['telegramChannelId'], message)

def notify_number_call(game_room, number):
    if game_room.get('telegramChannelId'):
        letter = get_letter_for_number(number)
        message = f"📢 Number Called: {letter}-{number}"
        send_telegram_message(game_room['telegramChannelId'], message)
```

## 🔒 Security Configuration

### 1. Environment Variables
```bash
# Production environment variables
ENVIRONMENT=production
DEBUG=false
CHAPA_SECRET_KEY=CHASECK_LIVE-your-live-key
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
TELEGRAM_BOT_TOKEN=your_production_bot_token
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 2. CORS Configuration
```python
# Update backend/app.py
CORS(app, origins=[
    'https://yourdomain.com',
    'https://www.yourdomain.com'
], allow_headers=['Content-Type', 'Authorization'], supports_credentials=True)
```

### 3. Rate Limiting
```python
# Add rate limiting
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/wallet/deposit', methods=['POST'])
@limiter.limit("5 per minute")
def wallet_deposit():
    # ... existing code
```

## 📊 Monitoring & Analytics

### 1. Error Tracking
```python
# Add Sentry for error tracking
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[FlaskIntegration()],
    traces_sample_rate=1.0
)
```

### 2. Performance Monitoring
```python
# Add performance monitoring
import time
from functools import wraps

def monitor_performance(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        
        # Log performance metrics
        print(f"{f.__name__} took {end_time - start_time:.2f} seconds")
        return result
    return decorated_function
```

### 3. Health Checks
```python
# Enhanced health check
@app.route('/health', methods=['GET'])
def health_check():
    try:
        # Check database connection
        fs_db.collection('health').document('test').get()
        
        # Check external services
        chapa_status = check_chapa_connection()
        
        return jsonify({
            "status": "healthy",
            "timestamp": time.time(),
            "services": {
                "database": "connected",
                "chapa": "connected" if chapa_status else "disconnected"
            }
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500
```

## 🚀 Go Live Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] Firebase security rules deployed
- [ ] Chapa webhooks configured
- [ ] Telegram bot commands working
- [ ] SSL certificates installed
- [ ] Domain DNS configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active

### Launch Day
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Test payment flow end-to-end
- [ ] Test Telegram bot integration
- [ ] Monitor error logs
- [ ] Test game creation and joining
- [ ] Verify wallet operations

### Post-Launch
- [ ] Monitor user registrations
- [ ] Track payment success rates
- [ ] Monitor game completion rates
- [ ] Check Telegram bot usage
- [ ] Review error logs daily
- [ ] Monitor server performance

## 🔧 Troubleshooting

### Common Issues

#### 1. Payment Failures
```bash
# Check Chapa configuration
curl -X POST https://api.chapa.co/v1/transaction/initialize \
  -H "Authorization: Bearer YOUR_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": "10", "currency": "ETB", "email": "test@example.com"}'
```

#### 2. Firebase Connection Issues
```python
# Test Firebase connection
try:
    doc_ref = fs_db.collection('test').document('connection')
    doc_ref.set({'timestamp': firestore.SERVER_TIMESTAMP})
    print("Firebase connection successful")
except Exception as e:
    print(f"Firebase connection failed: {e}")
```

#### 3. Telegram Bot Issues
```bash
# Check bot status
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe

# Check webhook status
curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
```

## 📈 Scaling Considerations

### Database Optimization
- Index frequently queried fields
- Implement data archiving for old transactions
- Use Firestore subcollections for large datasets

### Performance Optimization
- Implement Redis caching
- Use CDN for static assets
- Optimize database queries
- Implement connection pooling

### Load Balancing
- Use multiple backend instances
- Implement health checks
- Configure auto-scaling
- Monitor resource usage

## 🎯 Success Metrics

### Key Performance Indicators
- User registration rate
- Payment success rate
- Game completion rate
- Average session duration
- Revenue per user
- Customer support tickets

### Monitoring Tools
- Google Analytics for user behavior
- Sentry for error tracking
- Uptime monitoring for availability
- Performance monitoring for speed
- Revenue tracking for business metrics

This deployment guide ensures a robust, scalable, and secure production environment for your Epic Bingo Game. Follow each step carefully and test thoroughly before going live.