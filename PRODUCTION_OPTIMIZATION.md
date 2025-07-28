# Production Optimization Guide

## Build Optimization

### 1. Environment Variables
Create `.env.production` with:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_API_BASE_URL=https://your-production-api.com/api/v1
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
```

### 2. Build Commands
```bash
# Production build
npm run build:prod

# Development build
npm run build:dev

# Type checking
npm run type-check

# Linting
npm run lint:fix
```

### 3. Performance Optimizations

#### Code Splitting
- Routes are automatically code-split
- Large components should use `React.lazy()`

#### Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev vite-bundle-analyzer

# Add to vite.config.ts
import { visualizer } from 'vite-bundle-analyzer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
});
```

### 4. Security Considerations

#### Environment Variables
- Never commit `.env.production` to version control
- Use environment-specific variables
- Validate all environment variables on startup

#### API Security
- Use HTTPS in production
- Implement proper CORS policies
- Add rate limiting to API endpoints

### 5. Monitoring & Error Reporting

#### Error Tracking
```typescript
// Add to main.tsx
if (import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
  // Initialize error reporting service
  // e.g., Sentry, LogRocket, etc.
}
```

#### Performance Monitoring
```typescript
// Add to main.tsx
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  // Initialize analytics service
  // e.g., Google Analytics, Mixpanel, etc.
}
```

### 6. Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated for production
- [ ] Error boundary implemented
- [ ] Loading states optimized
- [ ] Mobile responsiveness tested
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] SSL certificate installed
- [ ] CDN configured (optional)
- [ ] Monitoring tools set up

### 7. Recommended Hosting Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build command
npm run build:prod

# Publish directory
dist
```

#### Railway
```bash
# Add to package.json
{
  "scripts": {
    "start": "vite preview --port $PORT"
  }
}
```

### 8. Post-Deployment Verification

1. **Functionality Tests**
   - [ ] Authentication works
   - [ ] All admin features accessible
   - [ ] CRUD operations functional
   - [ ] Mobile responsiveness verified

2. **Performance Tests**
   - [ ] Page load times < 3 seconds
   - [ ] Bundle size < 2MB
   - [ ] Lighthouse score > 90

3. **Security Tests**
   - [ ] HTTPS enforced
   - [ ] No sensitive data in client
   - [ ] CORS properly configured
   - [ ] Authentication tokens secure

### 9. Maintenance

#### Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Update environment variables as needed

#### Monitoring
- Set up uptime monitoring
- Configure error alerting
- Monitor performance metrics 