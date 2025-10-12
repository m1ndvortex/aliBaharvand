# Authentication System - Discord OAuth

## Overview
The platform uses **Discord OAuth 2.0** as the mandatory authentication method. All users must register and login using their Discord account.

---

## Why Discord OAuth?

### Benefits
- ✅ No password management (Discord handles security)
- ✅ Instant user verification
- ✅ Built-in community integration
- ✅ Reduced registration friction
- ✅ Discord profile information (username, avatar)
- ✅ Prevents multiple accounts (one Discord = one platform account)

---

## Discord OAuth Flow

### Step 1: User Clicks "Login with Discord"

**Frontend:**
```javascript
const DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_DISCORD_REDIRECT_URI;

function loginWithDiscord() {
  const discordAuthUrl = 
    `https://discord.com/api/oauth2/authorize?` +
    `client_id=${DISCORD_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=identify%20email`;
  
  window.location.href = discordAuthUrl;
}
```

### Step 2: User Authorizes on Discord

User is redirected to Discord's authorization page:
- Discord asks user to authorize the application
- User clicks "Authorize"
- Discord redirects back to our application with authorization code

### Step 3: Backend Exchanges Code for Token

**Discord redirects to:** `https://yourapp.com/auth/discord/callback?code=AUTHORIZATION_CODE`

**Backend (Django):**
```python
import requests
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['GET'])
def discord_callback(request):
    code = request.GET.get('code')
    
    if not code:
        return Response({'error': 'No authorization code'}, status=400)
    
    # Exchange code for access token
    token_response = requests.post(
        'https://discord.com/api/oauth2/token',
        data={
            'client_id': settings.DISCORD_CLIENT_ID,
            'client_secret': settings.DISCORD_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': settings.DISCORD_REDIRECT_URI
        },
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    
    if token_response.status_code != 200:
        return Response({'error': 'Failed to get access token'}, status=400)
    
    access_token = token_response.json()['access_token']
    
    # Get user info from Discord
    user_response = requests.get(
        'https://discord.com/api/users/@me',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    
    if user_response.status_code != 200:
        return Response({'error': 'Failed to get user info'}, status=400)
    
    discord_data = user_response.json()
    
    # Process user data
    user = process_discord_user(discord_data)
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh),
        'user': {
            'id': user.id,
            'email': user.email,
            'discord_username': user.discord_username,
            'discord_avatar': user.discord_avatar,
            'roles': [ur.role.name for ur in user.get_active_roles()]
        }
    })
```

### Step 4: Process Discord User Data

```python
from django.contrib.auth import get_user_model
from .models import Role, UserRole

User = get_user_model()

def process_discord_user(discord_data):
    """
    Create or update user based on Discord data
    
    Discord data structure:
    {
        "id": "123456789012345678",
        "username": "JohnDoe",
        "discriminator": "1234",
        "avatar": "a_1234567890abcdef1234567890abcdef",
        "email": "john@example.com",
        "verified": true
    }
    """
    
    discord_id = discord_data['id']
    discord_username = f"{discord_data['username']}#{discord_data['discriminator']}"
    discord_avatar = discord_data.get('avatar', '')
    email = discord_data.get('email', '')
    
    # Check if user exists
    user = User.objects.filter(discord_id=discord_id).first()
    
    if user:
        # Update existing user
        user.discord_username = discord_username
        user.discord_avatar = discord_avatar
        user.email = email
        user.last_login = timezone.now()
        user.save()
    else:
        # Create new user
        user = User.objects.create(
            discord_id=discord_id,
            discord_username=discord_username,
            discord_avatar=discord_avatar,
            email=email,
            status='active'
        )
        
        # Auto-assign 'client' role (no approval needed)
        client_role = Role.objects.get(name='client')
        UserRole.objects.create(
            user=user,
            role=client_role,
            status='active',
            approved_at=timezone.now()
        )
    
    return user
```

### Step 5: Frontend Receives JWT Token

```javascript
// Frontend receives response
const response = await fetch('/api/auth/discord/callback?code=' + code);
const data = await response.json();

// Store tokens
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);
localStorage.setItem('user', JSON.stringify(data.user));

// Redirect to dashboard
if (data.user.roles.includes('admin')) {
  navigate('/admin-dashboard');
} else if (data.user.roles.includes('advertiser')) {
  navigate('/advertiser-dashboard');
} else if (data.user.roles.includes('booster')) {
  navigate('/booster-dashboard');
} else {
  navigate('/client-dashboard');
}
```

---

## JWT Token Structure

### Access Token Payload
```json
{
  "user_id": 123,
  "discord_id": "123456789012345678",
  "email": "john@example.com",
  "discord_username": "JohnDoe#1234",
  "roles": ["client", "booster", "advertiser"],
  "exp": 1234567890,
  "iat": 1234567800
}
```

### Token Usage
```javascript
// Frontend: Include token in all API requests
const response = await fetch('/api/services', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

---

## User Model

### Django User Model
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Discord OAuth fields
    discord_id = models.CharField(max_length=100, unique=True, db_index=True)
    discord_username = models.CharField(max_length=100)
    discord_avatar = models.CharField(max_length=255, blank=True)
    
    # User info
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('pending', 'Pending'),
            ('suspended', 'Suspended')
        ],
        default='active'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)
    
    # Override username field (not needed with Discord)
    username = models.CharField(max_length=150, blank=True, null=True)
    
    USERNAME_FIELD = 'discord_id'
    REQUIRED_FIELDS = ['email']
    
    def __str__(self):
        return self.discord_username
    
    def has_role(self, role_name):
        """Check if user has a specific active role"""
        return UserRole.objects.filter(
            user=self,
            role__name=role_name,
            status='active'
        ).exists()
    
    def get_active_roles(self):
        """Get all active roles for user"""
        return UserRole.objects.filter(
            user=self,
            status='active'
        ).select_related('role')
    
    def get_discord_avatar_url(self):
        """Get full Discord avatar URL"""
        if self.discord_avatar:
            return f"https://cdn.discordapp.com/avatars/{self.discord_id}/{self.discord_avatar}.png"
        return None
```

---

## Frontend Components

### Login Page
```jsx
import React from 'react';

function LoginPage() {
  const handleDiscordLogin = () => {
    const clientId = process.env.REACT_APP_DISCORD_CLIENT_ID;
    const redirectUri = encodeURIComponent(process.env.REACT_APP_DISCORD_REDIRECT_URI);
    const scope = 'identify email';
    
    window.location.href = 
      `https://discord.com/api/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `response_type=code&` +
      `scope=${scope}`;
  };
  
  return (
    <div className="login-page">
      <h1>Welcome to Gaming Services Marketplace</h1>
      <p>Login with your Discord account to continue</p>
      
      <button onClick={handleDiscordLogin} className="discord-login-btn">
        <img src="/discord-logo.svg" alt="Discord" />
        Login with Discord
      </button>
      
      <p className="info">
        Don't have a Discord account? 
        <a href="https://discord.com/register" target="_blank">Create one here</a>
      </p>
    </div>
  );
}

export default LoginPage;
```

### Discord Callback Handler
```jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function DiscordCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      navigate('/login');
      return;
    }
    
    // Exchange code for tokens
    fetch(`/api/auth/discord/callback?code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          login(data);
          
          // Redirect based on roles
          const roles = data.user.roles;
          if (roles.includes('admin')) {
            navigate('/admin-dashboard');
          } else if (roles.includes('advertiser')) {
            navigate('/advertiser-dashboard');
          } else if (roles.includes('booster')) {
            navigate('/booster-dashboard');
          } else {
            navigate('/client-dashboard');
          }
        } else {
          navigate('/login');
        }
      })
      .catch(error => {
        console.error('Login failed:', error);
        navigate('/login');
      });
  }, [searchParams, navigate, login]);
  
  return (
    <div className="loading">
      <p>Logging in with Discord...</p>
    </div>
  );
}

export default DiscordCallback;
```

---

## Security Considerations

### 1. Token Security
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens stored in localStorage (consider httpOnly cookies for production)
- HTTPS only in production

### 2. Discord OAuth Security
- Client secret never exposed to frontend
- State parameter for CSRF protection (recommended)
- Validate redirect URI on backend

### 3. User Verification
- Discord email verification required
- One Discord account per platform account
- Discord ID is immutable (safe to use as identifier)

---

## Environment Variables

### Backend (.env)
```
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

### Frontend (.env)
```
REACT_APP_DISCORD_CLIENT_ID=your_discord_client_id
REACT_APP_DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback
```

---

## Discord Application Setup

### 1. Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name your application
4. Go to "OAuth2" section

### 2. Configure OAuth2
- **Redirects:** Add `http://localhost:3000/auth/discord/callback` (development)
- **Redirects:** Add `https://yourapp.com/auth/discord/callback` (production)
- **Scopes:** Select `identify` and `email`

### 3. Get Credentials
- Copy **Client ID**
- Copy **Client Secret**
- Add to environment variables

---

## API Endpoints

### Authentication Endpoints
```
GET  /api/auth/discord/callback?code=CODE  - Discord OAuth callback
POST /api/auth/refresh                     - Refresh access token
POST /api/auth/logout                      - Logout user
GET  /api/auth/me                          - Get current user info
```

---

## Error Handling

### Common Errors

#### 1. Invalid Authorization Code
```json
{
  "error": "invalid_grant",
  "error_description": "Invalid authorization code"
}
```
**Solution:** Code already used or expired. Restart OAuth flow.

#### 2. Discord API Error
```json
{
  "error": "Failed to get user info",
  "status": 401
}
```
**Solution:** Access token invalid. Check Discord API status.

#### 3. Email Not Verified
```json
{
  "error": "Email not verified",
  "message": "Please verify your Discord email"
}
```
**Solution:** User must verify email on Discord.

---

## Testing

### Manual Testing
1. Click "Login with Discord"
2. Authorize application on Discord
3. Verify redirect back to application
4. Check JWT token in localStorage
5. Verify user data in database

### Automated Testing
```python
# Django test
from django.test import TestCase
from unittest.mock import patch

class DiscordAuthTestCase(TestCase):
    @patch('requests.post')
    @patch('requests.get')
    def test_discord_callback(self, mock_get, mock_post):
        # Mock Discord API responses
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            'access_token': 'mock_token'
        }
        
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            'id': '123456789',
            'username': 'TestUser',
            'discriminator': '1234',
            'email': 'test@example.com'
        }
        
        # Test callback
        response = self.client.get('/api/auth/discord/callback?code=test_code')
        
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.json())
```

---

## Migration from Traditional Auth

If migrating from email/password authentication:

### 1. Add Discord Fields to Existing Users
```python
# Migration
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]
    
    operations = [
        migrations.AddField(
            model_name='user',
            name='discord_id',
            field=models.CharField(max_length=100, unique=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='discord_username',
            field=models.CharField(max_length=100, blank=True),
        ),
        migrations.AddField(
            model_name='user',
            name='discord_avatar',
            field=models.CharField(max_length=255, blank=True),
        ),
    ]
```

### 2. Link Existing Accounts
Allow users to link Discord to existing accounts:
```python
@api_view(['POST'])
def link_discord(request):
    user = request.user
    discord_data = request.data
    
    # Verify Discord account not already linked
    if User.objects.filter(discord_id=discord_data['id']).exists():
        return Response({'error': 'Discord account already linked'}, status=400)
    
    # Link Discord to user
    user.discord_id = discord_data['id']
    user.discord_username = discord_data['username']
    user.discord_avatar = discord_data['avatar']
    user.save()
    
    return Response({'message': 'Discord account linked successfully'})
```
