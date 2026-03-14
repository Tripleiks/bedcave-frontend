#!/bin/bash
# Bedcave Next.js WordPress Deployment Script
# Automatisiert Build, Export und Upload zum WordPress Server

set -e

# Configuration
THEME_NAME="bedcave-nextjs"
DIST_DIR="dist"
THEME_DIR="wordpress-theme"
STATIC_SUBDIR="nextjs-static"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Bedcave Next.js → WordPress Deployment                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Clean previous builds
echo -e "${YELLOW}[1/5] Cleaning previous builds...${NC}"
rm -rf $DIST_DIR
rm -rf $THEME_DIR/$STATIC_SUBDIR
mkdir -p $THEME_DIR/$STATIC_SUBDIR

# Step 2: Build static export
echo -e "${YELLOW}[2/5] Building static export...${NC}"
npm run build 2>&1

if [ ! -d "$DIST_DIR" ]; then
    echo -e "${RED}✗ Build failed - dist directory not found${NC}"
    exit 1
fi

# Step 3: Copy files to theme structure
echo -e "${YELLOW}[3/5] Preparing theme structure...${NC}"
cp -r $DIST_DIR/* $THEME_DIR/$STATIC_SUBDIR/

# Create theme zip
echo -e "${YELLOW}[4/5] Creating theme package...${NC}"
cd $THEME_DIR
zip -r ../bedcave-nextjs-theme.zip . -x "*.DS_Store" -x "*.git*" 2>/dev/null
cd ..

# Step 5: Display instructions
echo -e "${GREEN}[5/5] Build complete!${NC}"
echo ""
echo -e "${BLUE}📦 Deployment Package:${NC} bedcave-nextjs-theme.zip"
echo ""
echo -e "${YELLOW}📋 WordPress Installation Steps:${NC}"
echo ""
echo "1. Upload Theme:"
echo "   - WordPress Admin → Appearance → Themes → Add New → Upload Theme"
echo "   - Select: bedcave-nextjs-theme.zip"
echo "   - Activate Theme"
echo ""
echo "2. Configure Permalinks:"
echo "   - Settings → Permalinks → Select 'Post name'"
echo "   - Save Changes"
echo ""
echo "3. Enable CORS (optional - for API access):"
echo "   - Add to wp-config.php or use CORS plugin:"
echo "     define('WP_REST_CORS_ALLOW_ORIGIN', '*');"
echo ""
echo "4. Test the frontend:"
echo "   - Visit yoursite.com - should show Next.js frontend"
echo "   - Admin stays at yoursite.com/wp-admin"
echo ""
echo -e "${GREEN}✓ Ready for deployment!${NC}"
echo ""

# Optional: Auto-upload if WP credentials provided
if [ -f ".env.deploy" ]; then
    source .env.deploy
    if [ ! -z "$WP_HOST" ] && [ ! -z "$WP_USER" ] && [ ! -z "$WP_PASS" ]; then
        echo -e "${YELLOW}🚀 Auto-uploading to WordPress...${NC}"
        # FTP/SCP upload logic would go here
        echo "   (Configure .env.deploy for auto-upload)"
    fi
fi

# File sizes
echo -e "${BLUE}📊 Package Size:${NC}"
du -h bedcave-nextjs-theme.zip | awk '{print $1}'
echo ""

exit 0
