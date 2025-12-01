# GitHub Pages Fix - Summary

## Problem
The application was not showing question banks from the `bank` folder when deployed to GitHub Pages at https://exam-emmulator.github.io/

## Root Cause
The initial implementation relied on a Node.js server API (`/api/question-banks`) to dynamically read files from the `bank` folder. GitHub Pages only serves static files and cannot run server-side code.

## Solution
Implemented a hybrid approach that works in both development (with server) and production (GitHub Pages):

### 1. Build-Time Processing (script/build-static.ts)
- Reads all JSON files from `bank` folder during build
- Copies them to `dist/public/bank/`
- Generates a `manifest.json` with metadata
- Ensures all question banks are included in the static build

### 2. Client-Side Fallback (client/src/data/sample-questions.ts)
- First tries to fetch from API (works in development)
- Falls back to static files if API is unavailable (works on GitHub Pages)
- Loads `manifest.json` to discover available banks
- Fetches individual bank files as needed

### 3. Automatic Deployment (.github/workflows/deploy.yml)
- Already configured correctly
- Runs `npx tsx script/build-static.ts`
- Deploys `dist/public` to GitHub Pages
- Includes all bank files automatically

## How to Deploy

### For First-Time Deployment
```bash
# 1. Add your question banks
cp your-questions.json bank/

# 2. Commit and push
git add bank/your-questions.json
git commit -m "Add question banks"
git push origin main

# 3. Enable GitHub Pages
# Go to Settings > Pages > Select "GitHub Actions"

# 4. Wait for deployment (1-2 minutes)
# Visit https://<username>.github.io/<repo-name>/
```

### For Updates
```bash
# 1. Update or add question banks
vim bank/aws_ai_practitioner_bank.json

# 2. Commit and push
git add bank/
git commit -m "Update question banks"
git push origin main

# 3. Wait for automatic redeployment
# Clear browser cache and refresh
```

## Verification

### Check Build Output
```bash
npm install
npx tsx script/build-static.ts

# Verify files were created
ls -la dist/public/bank/
cat dist/public/bank/manifest.json
```

### Test Locally
```bash
# Build and serve
npx tsx script/build-static.ts
npx serve dist/public

# Open http://localhost:3000
# Should see all question banks
```

### Check GitHub Actions
1. Go to repository **Actions** tab
2. Click on latest workflow run
3. Verify "Build static site" step succeeded
4. Check that bank files were processed

### Verify Deployment
1. Visit your GitHub Pages URL
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Should see requests to `/bank/manifest.json` and `/bank/*.json`
6. All requests should return 200 OK

## Files Changed

### Modified
- `script/build-static.ts` - Added bank folder processing
- `client/src/data/sample-questions.ts` - Added static file fallback
- `README.md` - Updated deployment instructions
- `CHANGES.md` - Documented changes

### Created
- `DEPLOYMENT.md` - Comprehensive deployment guide
- `GITHUB_PAGES_FIX.md` - This file
- `verify-setup.sh` - Setup verification script
- `bank/example-questions.json` - Example question bank

## Testing Checklist

- [x] Build completes successfully
- [x] Bank files copied to dist/public/bank/
- [x] manifest.json created correctly
- [x] Local serve works (npx serve dist/public)
- [x] Question banks load in browser
- [x] Both development and production modes work
- [x] GitHub Actions workflow configured correctly

## Troubleshooting

### Banks not showing after deployment

1. **Check GitHub Actions logs**:
   - Actions tab > Latest workflow
   - Look for "Processing question banks" section
   - Verify files were copied

2. **Clear browser cache**:
   ```
   Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   ```

3. **Clear localStorage**:
   - DevTools > Application > Local Storage
   - Delete all `exam_portal_*` items
   - Refresh page

4. **Check browser console**:
   - F12 > Console tab
   - Look for errors loading bank files

5. **Verify files exist**:
   - Visit `https://<username>.github.io/<repo>/bank/manifest.json`
   - Should return JSON with list of banks

### Build fails

1. **Validate JSON**:
   ```bash
   npm run normalize-banks
   ```

2. **Check file names**:
   - Use lowercase with hyphens
   - No spaces or special characters

3. **Test locally first**:
   ```bash
   npx tsx script/build-static.ts
   ```

## Benefits

✅ **Works on GitHub Pages** - No server required
✅ **Automatic deployment** - Push to deploy
✅ **Backward compatible** - Works in development too
✅ **Easy to update** - Just add/edit JSON files
✅ **Fast loading** - Static files cached by CDN
✅ **No configuration** - Works out of the box

## Next Steps

1. **Add your question banks** to the `bank` folder
2. **Test locally** with `npx tsx script/build-static.ts && npx serve dist/public`
3. **Push to GitHub** and wait for deployment
4. **Verify** at your GitHub Pages URL
5. **Share** your exam portal!

## Support

For issues or questions:
- Check `DEPLOYMENT.md` for detailed instructions
- Review `bank/README.md` for question format
- Run `./verify-setup.sh` to check your setup
- Check GitHub Actions logs for build errors
