# Deployment Guide

## GitHub Pages Deployment

This application is designed to work seamlessly on GitHub Pages with automatic question bank loading.

### Initial Setup

1. **Fork or clone this repository**
2. **Add your question banks** to the `bank` folder
3. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add question banks"
   git push origin main
   ```

4. **Enable GitHub Pages**:
   - Go to repository **Settings** > **Pages**
   - Under "Build and deployment", select **GitHub Actions**
   - Wait for the workflow to complete

5. **Access your site**:
   - Visit `https://<username>.github.io/<repository-name>/`
   - All question banks from the `bank` folder will be available

### Adding New Question Banks

1. **Create a JSON file** in the `bank` folder:
   ```bash
   # Example: bank/my-exam-questions.json
   ```

2. **Follow the format** (see `bank/README.md` for details):
   ```json
   {
     "id": "my-exam",
     "name": "My Exam Questions",
     "description": "Practice questions for my exam",
     "questions": [
       {
         "question": "Your question?",
         "options": ["A", "B", "C", "D"],
         "correct_answer": "A",
         "explanation": "Why A is correct"
       }
     ]
   }
   ```

3. **Commit and push**:
   ```bash
   git add bank/my-exam-questions.json
   git commit -m "Add my exam questions"
   git push origin main
   ```

4. **Wait for deployment** (usually 1-2 minutes)

5. **Refresh your site** - the new question bank will appear automatically!

### Updating Existing Question Banks

1. **Edit the JSON file** in the `bank` folder
2. **Commit and push**:
   ```bash
   git add bank/aws_ai_practitioner_bank.json
   git commit -m "Update AWS AI questions"
   git push origin main
   ```
3. **Wait for redeployment**
4. **Clear browser cache** or hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### Troubleshooting

#### Question banks not showing up

1. **Check GitHub Actions**:
   - Go to the **Actions** tab in your repository
   - Verify the latest workflow completed successfully
   - Check the build logs for errors

2. **Verify JSON format**:
   ```bash
   # Test locally first
   npm install
   npx tsx script/build-static.ts
   npx serve dist/public
   ```

3. **Check browser console**:
   - Open DevTools (F12)
   - Look for errors in the Console tab
   - Check Network tab for failed requests

4. **Clear cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or clear browser cache completely

#### Build failing

1. **Check JSON syntax**:
   ```bash
   # Validate JSON files
   npm run normalize-banks
   ```

2. **Check file names**:
   - Use lowercase with hyphens: `my-questions.json`
   - Avoid spaces and special characters

3. **Check file size**:
   - GitHub Pages has a 1GB limit
   - Keep individual bank files under 10MB for best performance

#### Old data showing

This is usually a caching issue:

1. **Clear localStorage**:
   - Open DevTools > Application > Local Storage
   - Delete all items starting with `exam_portal_`
   - Refresh the page

2. **Hard refresh** the page

3. **Try incognito/private mode**

### Custom Domain

To use a custom domain:

1. **Create a CNAME file** in `client/public/`:
   ```
   yourdomain.com
   ```

2. **Configure DNS** with your domain provider:
   - Add a CNAME record pointing to `<username>.github.io`
   - Or A records pointing to GitHub Pages IPs

3. **Enable HTTPS** in repository Settings > Pages

4. **Commit and push**:
   ```bash
   git add client/public/CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

### Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Build static site
npx tsx script/build-static.ts

# Serve locally
npx serve dist/public

# Open http://localhost:3000
```

This simulates the GitHub Pages environment exactly.

### Performance Tips

1. **Optimize question banks**:
   - Keep individual files under 5MB
   - Split large banks into multiple files
   - Remove unnecessary fields (hints, references if not used)

2. **Use browser caching**:
   - Question banks are cached in localStorage
   - Only fetched once per browser

3. **Lazy loading**:
   - Banks are loaded on-demand
   - Only active bank questions are in memory

### Monitoring

Check deployment status:
- **Actions tab**: See build and deploy progress
- **Environments**: View deployment history
- **Pages settings**: See current deployment URL

### Rollback

To rollback to a previous version:

1. **Find the commit** you want to rollback to
2. **Revert or reset**:
   ```bash
   git revert <commit-hash>
   # or
   git reset --hard <commit-hash>
   git push --force origin main
   ```
3. **Wait for redeployment**

### Security

- All data is stored in browser localStorage
- No server-side data storage
- No user authentication required
- Question banks are publicly accessible
- Don't include sensitive information in question banks

### Limits

GitHub Pages limits:
- **Repository size**: 1GB recommended
- **File size**: 100MB per file
- **Bandwidth**: 100GB/month soft limit
- **Build time**: 10 minutes max

### Support

If you encounter issues:
1. Check the [GitHub Actions logs]
2. Review `bank/README.md` for format details
3. Test locally with `npx serve dist/public`
4. Check browser console for errors
5. Verify JSON syntax with `npm run normalize-banks`

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository
2. Build command: `npx tsx script/build-static.ts`
3. Publish directory: `dist/public`

### Vercel

1. Import your GitHub repository
2. Framework: Other
3. Build command: `npx tsx script/build-static.ts`
4. Output directory: `dist/public`

### Self-Hosted

For a full server with API:

```bash
npm install
npm run build
npm start
```

This runs the Express server with dynamic API endpoints.
