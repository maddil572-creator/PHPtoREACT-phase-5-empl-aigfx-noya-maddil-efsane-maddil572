# 🤖 AI Integration Setup Guide

Complete guide to implement AI features in your Adil GFX platform on shared hosting.

## 📋 **Quick Setup Checklist**

- [ ] Get OpenAI API key
- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Test AI endpoints
- [ ] Configure admin panel
- [ ] Deploy AI chat widget
- [ ] Set up budget monitoring

---

## 🔑 **Step 1: Get OpenAI API Key**

### Create OpenAI Account
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the API key (starts with `sk-`)

### Set Up Billing (Required)
1. Go to **Billing** → **Payment methods**
2. Add a credit card
3. Set up **Usage limits** (recommended: $50/month)
4. Enable **Email notifications** for budget alerts

**💡 Cost Estimate:** $20-50/month for moderate usage (500-1000 AI requests)

---

## ⚙️ **Step 2: Configure Environment**

### Update .env File
Add these variables to your `backend/.env` file:

```env
# AI Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
AI_MONTHLY_BUDGET=50.00
AI_CONTENT_GENERATION_ENABLED=true
AI_CHAT_SUPPORT_ENABLED=true
AI_SEO_OPTIMIZATION_ENABLED=true
AI_CACHE_TTL=86400
AI_MAX_TOKENS_PER_REQUEST=4000
AI_RATE_LIMIT_PER_HOUR=100
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
```

### Verify Configuration
```bash
# Test API key
curl -H "Authorization: Bearer sk-your-api-key" https://api.openai.com/v1/models
```

---

## 🗄️ **Step 3: Database Setup**

### Run AI Migrations
```bash
# Navigate to backend directory
cd backend

# Run the AI database migration
mysql -u your_username -p your_database < database/migrations/ai_features_schema.sql
```

### Verify Tables Created
```sql
SHOW TABLES LIKE 'ai_%';
-- Should show: ai_usage_log, ai_response_cache, ai_config, etc.
```

### Check Default Configuration
```sql
SELECT * FROM ai_config WHERE is_active = TRUE;
```

---

## 🧪 **Step 4: Test AI Integration**

### Test API Endpoint
```bash
# Test blog generation
curl -X POST http://localhost:8000/api/ai.php/generate/blog \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "How to Design Professional Logos",
    "keywords": ["logo design", "branding"],
    "tone": "professional",
    "length": "medium"
  }'
```

### Test Chat Support
```bash
# Test support chat
curl -X POST http://localhost:8000/api/ai.php/chat/support \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How much does logo design cost?",
    "context": {"source": "test"}
  }'
```

### Expected Response Format
```json
{
  "success": true,
  "data": {
    "title": "How to Design Professional Logos",
    "content": "...",
    "meta_description": "...",
    "cost": 0.0234
  },
  "usage": {
    "total_tokens": 1250
  }
}
```

---

## 🎛️ **Step 5: Admin Panel Setup**

### Add AI Management to Admin
1. Copy `src/admin/pages/AI/AIManagement.tsx` to your admin pages
2. Add route to admin router:

```tsx
// In your admin router file
import AIManagement from './pages/AI/AIManagement';

// Add route
<Route path="/ai" element={<AIManagement />} />
```

### Add Navigation Link
```tsx
// In admin sidebar/navigation
<NavLink to="/ai" className="nav-link">
  <Brain className="h-4 w-4" />
  AI Management
</NavLink>
```

### Test Admin Interface
1. Login to admin panel
2. Navigate to **AI Management**
3. Check usage statistics
4. Test content generation
5. Verify budget tracking

---

## 💬 **Step 6: Deploy Chat Widget**

### Add to Main Layout
```tsx
// In your main layout component (App.tsx or Layout.tsx)
import AIChatWidget from '@/components/AIChatWidget';

function Layout() {
  return (
    <div>
      {/* Your existing layout */}
      
      {/* Add AI Chat Widget */}
      <AIChatWidget 
        position="bottom-right"
        primaryColor="#dc2626"
      />
    </div>
  );
}
```

### Customize Chat Widget
```tsx
// Custom styling example
<AIChatWidget 
  position="bottom-right"
  theme="light"
  primaryColor="#your-brand-color"
  className="custom-chat-widget"
/>
```

### Test Chat Widget
1. Open your website
2. Click the chat button (bottom-right)
3. Send a test message
4. Verify AI response
5. Check suggested actions work

---

## 📊 **Step 7: Budget Monitoring**

### Set Up Alerts
```sql
-- Create budget alert procedure
DELIMITER //
CREATE PROCEDURE CheckAIBudget()
BEGIN
    DECLARE current_spend DECIMAL(10,6);
    DECLARE budget_limit DECIMAL(10,2);
    DECLARE usage_percent DECIMAL(5,2);
    
    SELECT 
        COALESCE(SUM(cost), 0),
        (SELECT config_value FROM ai_config WHERE config_key = 'monthly_budget')
    INTO current_spend, budget_limit
    FROM ai_usage_log 
    WHERE YEAR(created_at) = YEAR(CURDATE()) 
    AND MONTH(created_at) = MONTH(CURDATE());
    
    SET usage_percent = (current_spend / budget_limit) * 100;
    
    IF usage_percent >= 80 THEN
        -- Log alert or send notification
        INSERT INTO ai_usage_log (operation, cost, created_at) 
        VALUES ('budget_alert', usage_percent, NOW());
    END IF;
END //
DELIMITER ;
```

### Monitor Usage Dashboard
Access: `https://yourdomain.com/admin/ai`

**Key Metrics to Watch:**
- Monthly spend vs budget
- Requests per operation type
- Cache hit rate
- Average cost per request
- Most expensive operations

---

## 🚀 **Step 8: Hostinger Deployment**

### Upload Files
```bash
# Files to upload to Hostinger
backend/classes/OpenAIIntegration.php
backend/api/ai.php
backend/database/migrations/ai_features_schema.sql
src/components/AIChatWidget.tsx
src/admin/pages/AI/AIManagement.tsx
```

### Hostinger-Specific Settings
```ini
# In backend/.user.ini (Hostinger PHP config)
max_execution_time = 120
memory_limit = 256M
post_max_size = 10M
upload_max_filesize = 10M
```

### Test on Hostinger
1. Upload all files via FTP/File Manager
2. Run database migration via phpMyAdmin
3. Update `.env` with OpenAI API key
4. Test API endpoints
5. Verify chat widget works

---

## 💰 **Cost Optimization Tips**

### 1. Use Caching Effectively
- 24-hour cache for blog content
- 1-hour cache for chat responses
- Cache similar requests

### 2. Choose Right Model
- **gpt-4o-mini**: $0.15/1M tokens (cheaper)
- **gpt-4o**: $5.00/1M tokens (better quality)

### 3. Optimize Prompts
- Be specific and concise
- Use system messages effectively
- Limit max_tokens parameter

### 4. Monitor Usage
- Set up budget alerts
- Track cost per operation
- Identify expensive operations

### 5. Rate Limiting
- Limit requests per user/hour
- Implement cooldown periods
- Use progressive pricing

---

## 🔧 **Troubleshooting**

### Common Issues

**1. API Key Not Working**
```bash
# Test API key
curl -H "Authorization: Bearer sk-your-key" \
  https://api.openai.com/v1/models
```

**2. Database Connection Error**
```sql
-- Check if tables exist
SHOW TABLES LIKE 'ai_%';

-- Check AI config
SELECT * FROM ai_config;
```

**3. Budget Exceeded Error**
```sql
-- Check current spend
SELECT SUM(cost) as total_spend 
FROM ai_usage_log 
WHERE YEAR(created_at) = YEAR(CURDATE()) 
AND MONTH(created_at) = MONTH(CURDATE());
```

**4. Chat Widget Not Loading**
- Check browser console for errors
- Verify API endpoint is accessible
- Check CORS settings

**5. Slow Response Times**
- Reduce max_tokens parameter
- Use faster model (gpt-4o-mini)
- Implement request queuing

### Debug Mode
```env
# Add to .env for debugging
AI_LOG_ALL_REQUESTS=true
AI_DEBUG_MODE=true
```

### Log Locations
- **API Logs**: `backend/logs/ai_requests.log`
- **Error Logs**: `backend/logs/error.log`
- **Database Logs**: `ai_usage_log` table

---

## 📈 **Performance Monitoring**

### Key Performance Indicators (KPIs)

1. **Cost Efficiency**
   - Cost per successful request
   - Cache hit rate (target: >70%)
   - Monthly spend vs budget

2. **User Experience**
   - Average response time (target: <5 seconds)
   - Chat completion rate
   - User satisfaction scores

3. **Technical Performance**
   - API success rate (target: >95%)
   - Error rate by operation
   - Server resource usage

### Monthly Review Checklist
- [ ] Review budget usage
- [ ] Analyze most/least used features
- [ ] Check cache effectiveness
- [ ] Review user feedback
- [ ] Optimize expensive operations
- [ ] Update AI prompts if needed

---

## 🆘 **Support & Resources**

### OpenAI Resources
- **Documentation**: https://platform.openai.com/docs
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Community**: https://community.openai.com/
- **Status Page**: https://status.openai.com/

### Cost Calculator
- **OpenAI Pricing**: https://openai.com/pricing
- **Token Counter**: https://platform.openai.com/tokenizer

### Emergency Contacts
- **OpenAI Support**: https://help.openai.com/
- **Hostinger Support**: 24/7 live chat
- **Your Development Team**: [Your contact info]

---

## ✅ **Final Verification**

Before going live, verify:

- [ ] ✅ OpenAI API key is valid and has billing set up
- [ ] ✅ All database tables created successfully
- [ ] ✅ AI endpoints return successful responses
- [ ] ✅ Chat widget displays and responds
- [ ] ✅ Admin panel shows usage statistics
- [ ] ✅ Budget tracking is working
- [ ] ✅ Caching is reducing API calls
- [ ] ✅ Error handling works properly
- [ ] ✅ Rate limiting prevents abuse
- [ ] ✅ All features work on Hostinger

**🎉 Congratulations! Your AI integration is ready to enhance your client experience and streamline your operations.**

---

## 📞 **Need Help?**

If you encounter any issues during setup:

1. **Check the troubleshooting section** above
2. **Review OpenAI documentation** for API-specific issues
3. **Contact Hostinger support** for hosting-related problems
4. **Test with smaller requests** to isolate issues

**Estimated Setup Time**: 2-4 hours  
**Expected ROI**: 300-600% within 3 months  
**Monthly Cost**: $20-50 for moderate usage