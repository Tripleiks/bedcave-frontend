#!/bin/bash
# WordPress Theme Auto-Upload via API or SSH
# Einfache Alternative zum Python-Skript - nutzt nur curl

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

THEME_FILE="bedcave-nextjs-theme.zip"
INSTALLER_PHP="theme-installer.php"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  WordPress Theme Auto-Upload                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if theme file exists
if [ ! -f "$THEME_FILE" ]; then
    echo -e "${RED}✗ Theme nicht gefunden: $THEME_FILE${NC}"
    echo "Führe zuerst aus: ./deploy-to-wordpress.sh"
    exit 1
fi

echo -e "${YELLOW}Wähle Upload-Methode:${NC}"
echo ""
echo "1) WordPress Admin (Manuell - Empfohlen)"
echo "   → Schnellste & sicherste Methode"
echo ""
echo "2) SSH/SCP (Automatisch - falls du Server-Zugang hast)"
echo "   → Benötigt SSH-Key oder Passwort"
echo ""
echo "3) Temporäres PHP-Skript (Fallback)"
echo "   → Erstellt theme-installer.php zum manuellen Upload"
echo ""

read -p "Option (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${GREEN}📋 Manuelle Upload-Anleitung:${NC}"
        echo ""
        echo "1. Melde dich an: https://bedcave.com/wp-admin"
        echo ""
        echo "2. Gehe zu: Appearance → Themes → Add New → Upload Theme"
        echo ""
        echo "3. Wähle: $THEME_FILE"
        echo "   (liegt in: $(pwd)/$THEME_FILE)"
        echo ""
        echo "4. Klicke: Install Now → Activate"
        echo ""
        echo "5. Permalinks einstellen:"
        echo "   Settings → Permalinks → Post name → Save"
        echo ""
        echo -e "${GREEN}✓ Bereit zum manuellen Upload!${NC}"
        echo ""
        
        # Open file location in Finder
        if command -v open &> /dev/null; then
            open .
        fi
        ;;
        
    2)
        echo ""
        read -p "SSH User: " ssh_user
        read -p "SSH Host (z.B. bedcave.com): " ssh_host
        read -p "WordPress Pfad [/var/www/html]: " wp_path
        wp_path=${wp_path:-/var/www/html}
        
        echo ""
        echo -e "${YELLOW}📤 Upload via SCP...${NC}"
        
        # Create temp directory and extract theme
        TEMP_DIR=$(mktemp -d)
        unzip -q "$THEME_FILE" -d "$TEMP_DIR"
        
        # Upload
        echo "→ Lade Theme hoch..."
        if scp -r "$TEMP_DIR"/* "$ssh_user@$ssh_host:$wp_path/wp-content/themes/" 2>/dev/null; then
            echo -e "${GREEN}✓ Upload erfolgreich!${NC}"
            echo ""
            echo "→ Theme aktivieren:"
            echo "  https://bedcave.com/wp-admin/themes.php"
        else
            echo -e "${RED}✗ Upload fehlgeschlagen${NC}"
            echo "Prüfe SSH-Zugang oder nutze Methode 1 (Manuell)"
        fi
        
        # Cleanup
        rm -rf "$TEMP_DIR"
        ;;
        
    3)
        echo ""
        echo -e "${YELLOW}📄 Erstelle PHP Installer...${NC}"
        
        # Generate secret
        SECRET=$(openssl rand -hex 16)
        
        cat > "$INSTALLER_PHP" << EOF
<?php
// WordPress Theme Auto-Installer
// Upload this file to WordPress root, call via browser, then DELETE!

\$key = \$_GET['key'] ?? '';
if (\$key !== '$SECRET') {
    die('Unauthorized');
}

require_once('wp-load.php');

if (!current_user_can('install_themes')) {
    die('Insufficient permissions');
}

\$file = \$_FILES['theme'] ?? null;
if (!\$file) {
    echo '<h2>Bedcave Theme Installer</h2>';
    echo '<form method="post" enctype="multipart/form-data">';
    echo '<input type="file" name="theme" accept=".zip" required><br><br>';
    echo '<button type="submit">Install & Activate Theme</button>';
    echo '</form>';
    exit;
}

require_once(ABSPATH . 'wp-admin/includes/class-wp-upgrader.php');
require_once(ABSPATH . 'wp-admin/includes/theme.php');

\$upgrader = new Theme_Upgrader();
\$result = \$upgrader->install(\$file['tmp_name']);

if (\$result === true) {
    echo "✓ Theme installed!<br>";
    switch_theme('bedcave-nextjs');
    echo "✓ Theme activated!<br>";
    echo "<br>Delete this file: theme-installer.php";
    unlink(__FILE__);
} else {
    echo "✗ Error: " . print_r(\$result, true);
}
EOF
        
        echo -e "${GREEN}✓ $INSTALLER_PHP erstellt${NC}"
        echo ""
        echo -e "${YELLOW}📋 Manuelle Schritte:${NC}"
        echo ""
        echo "1. Upload folgende Dateien zu WordPress root:"
        echo "   - $THEME_FILE"
        echo "   - $INSTALLER_PHP"
        echo ""
        echo "2. Browser öffnen:"
        echo "   https://bedcave.com/theme-installer.php?key=$SECRET"
        echo ""
        echo "3. ZIP-Datei hochladen via Formular"
        echo ""
        echo "4. Das PHP-Skript löscht sich automatisch"
        echo ""
        
        # Open in Finder
        if command -v open &> /dev/null; then
            open .
        fi
        ;;
        
    *)
        echo -e "${RED}Ungültige Option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📊 Theme Info:${NC}"
ls -lh "$THEME_FILE"
echo ""
