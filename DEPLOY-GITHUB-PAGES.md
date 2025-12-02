# Deploy Ghost Crossing to GitHub Pages

## Quick Setup (5 Minutes)

### Step 1: Push to GitHub

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit - Ghost Crossing game"

# Create a new repository on GitHub.com, then:
git remote add origin https://github.com/YOUR-USERNAME/ghost-crossing.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click the **Settings** tab
3. Click **Pages** in the left sidebar
4. Under "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** / **(root)**
   - Click **Save**

### Step 3: Wait & Visit

GitHub will build your site (takes 1-2 minutes).

Your game will be live at:
```
https://YOUR-USERNAME.github.io/ghost-crossing/
```

## Verify Deployment

Check the Actions tab in your repository to see the deployment status.

## Update Your Game

Whenever you make changes:

```bash
git add .
git commit -m "Update game"
git push
```

GitHub Pages will automatically redeploy (takes 1-2 minutes).

## Custom Domain (Optional)

### Add Custom Domain

1. Buy a domain (e.g., from Namecheap, Google Domains)
2. In GitHub repo: Settings → Pages → Custom domain
3. Enter your domain: `ghostcrossing.com`
4. Click Save

### Update DNS Records

At your domain registrar, add these DNS records:

**For apex domain (ghostcrossing.com):**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: YOUR-USERNAME.github.io
```

Wait 24-48 hours for DNS propagation.

## Troubleshooting

### Game Not Loading
- Check that `index.html`, `game.js`, and `style.css` are in the root directory
- Verify files are committed and pushed to GitHub
- Check Actions tab for deployment errors

### 404 Error
- Make sure GitHub Pages is enabled
- Verify the branch is set to `main`
- Check that `index.html` exists in the root

### Changes Not Showing
- Wait 1-2 minutes for deployment
- Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check Actions tab to see if deployment completed

## Alternative: GitHub Pages with Docs Folder

If you want to keep your project organized:

1. Create a `docs` folder
2. Move `index.html`, `game.js`, `style.css` into `docs/`
3. In GitHub Pages settings, select branch `main` and folder `/docs`

## Benefits of GitHub Pages

✓ **Free** - No cost for public repositories
✓ **Fast** - CDN-backed hosting
✓ **HTTPS** - Automatic SSL certificate
✓ **Easy** - Automatic deployment on push
✓ **Custom Domain** - Bring your own domain
✓ **No Server** - Static hosting, perfect for your game

## Share Your Game

Once deployed, share your game URL:
```
https://YOUR-USERNAME.github.io/ghost-crossing/
```

Add it to your README.md:
```markdown
## Play Online

🎮 [Play Ghost Crossing](https://YOUR-USERNAME.github.io/ghost-crossing/)
```

## Next Steps

1. Push your code to GitHub
2. Enable GitHub Pages
3. Share your game with the world! 🎉
