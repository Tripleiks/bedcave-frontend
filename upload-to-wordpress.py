#!/usr/bin/env python3
"""
Bedcave Next.js WordPress Auto-Deploy
Upload Theme via WordPress API or SSH/FTP
"""

import requests
import os
import sys
import zipfile
import argparse
from pathlib import Path
from urllib.parse import urljoin

# WordPress API Endpoints
WP_API_THEMES = '/wp-json/wp/v2/themes'
WP_API_STATUS = '/wp-json/wp/v2/'
WP_LOGIN = '/wp-login.php'

class WordPressDeployer:
    def __init__(self, wp_url, username, password):
        self.wp_url = wp_url.rstrip('/')
        self.username = username
        self.password = password
        self.session = requests.Session()
        self.session.verify = True
        
    def test_connection(self):
        """Test WordPress API connectivity"""
        try:
            response = self.session.get(
                f"{self.wp_url}{WP_API_STATUS}",
                timeout=10
            )
            if response.status_code == 200:
                print(f"✓ WordPress API erreichbar: {self.wp_url}")
                return True
            else:
                print(f"✗ API nicht erreichbar (Status: {response.status_code})")
                return False
        except Exception as e:
            print(f"✗ Verbindungsfehler: {e}")
            return False
    
    def upload_via_api(self, theme_zip_path):
        """
        Upload Theme via WordPress REST API
        Note: WordPress Core REST API doesn't support theme installation directly
        We use a workaround via Plugin installation endpoint (if plugin is installed)
        or provide alternative methods
        """
        print("\n📤 Upload via WordPress API...")
        
        # Create application password auth
        auth = (self.username, self.password)
        
        # Method 1: Try Plugin Install endpoint (works if theme upload is enabled)
        url = f"{self.wp_url}/wp-json/wp/v2/plugins"
        
        try:
            with open(theme_zip_path, 'rb') as f:
                files = {'file': ('bedcave-nextjs-theme.zip', f, 'application/zip')}
                
                response = self.session.post(
                    url,
                    files=files,
                    auth=auth,
                    timeout=60
                )
                
                if response.status_code in [200, 201]:
                    print(f"✓ Upload erfolgreich!")
                    return True
                else:
                    print(f"✗ API Upload fehlgeschlagen: {response.status_code}")
                    print(f"Response: {response.text[:200]}")
                    return False
                    
        except Exception as e:
            print(f"✗ Upload Fehler: {e}")
            return False
    
    def generate_install_php(self, theme_zip_path):
        """
        Generate a temporary PHP script for theme installation
        This can be uploaded and executed on the server
        """
        php_script = """<?php
/**
 * Temporary Theme Installer
 * Upload this file to WordPress root, call it via browser, then DELETE it!
 */

// Security: Check for secret key
$secret_key = $_GET['key'] ?? '';
if ($secret_key !== '%%SECRET%%') {
    die('Unauthorized');
}

// Load WordPress
require_once('wp-load.php');

if (!current_user_can('install_themes')) {
    die('Insufficient permissions');
}

// Theme upload
$theme_file = $_FILES['theme'] ?? null;
if (!$theme_file) {
    echo '<form method="post" enctype="multipart/form-data">';
    echo '<input type="file" name="theme" accept=".zip" required>';
    echo '<button type="submit">Install Theme</button>';
    echo '</form>';
    exit;
}

// Install theme
require_once(ABSPATH . 'wp-admin/includes/class-wp-upgrader.php');
require_once(ABSPATH . 'wp-admin/includes/theme.php');

$upgrader = new Theme_Upgrader();
$result = $upgrader->install($theme_file['tmp_name']);

if ($result === true) {
    echo "✓ Theme installed successfully!\n";
    // Activate theme
    switch_theme('bedcave-nextjs');
    echo "✓ Theme activated!\n";
} else {
    echo "✗ Installation failed: " . print_r($result, true) . "\n";
}

// Self-destruct
unlink(__FILE__);
echo "✓ Installer self-destructed\n";
"""
        
        secret = os.urandom(16).hex()
        php_script = php_script.replace('%%SECRET%%', secret)
        
        installer_path = Path(theme_zip_path).parent / 'theme-installer.php'
        with open(installer_path, 'w') as f:
            f.write(php_script)
        
        print(f"\n📄 Temporäres PHP-Installer erstellt: {installer_path}")
        print(f"🔑 Secret Key: {secret}")
        print(f"\n⚠️  Manuelle Schritte:")
        print(f"1. Upload theme-installer.php + bedcave-nextjs-theme.zip zu {self.wp_url}/")
        print(f"2. Browser öffnen: {self.wp_url}/theme-installer.php?key={secret}")
        print(f"3. ZIP-Datei hochladen via Formular")
        print(f"4. Das PHP-Skript löscht sich selbst nach Installation")
        
        return installer_path, secret

def main():
    parser = argparse.ArgumentParser(
        description='Deploy Bedcave Next.js Theme to WordPress'
    )
    parser.add_argument('--url', required=True, help='WordPress URL (https://bedcave.com)')
    parser.add_argument('--user', help='WordPress Username')
    parser.add_argument('--pass', dest='password', help='WordPress Password or App Password')
    parser.add_argument('--theme', default='bedcave-nextjs-theme.zip', help='Theme ZIP file')
    parser.add_argument('--method', choices=['api', 'php', 'scp'], default='php', 
                        help='Deployment method')
    parser.add_argument('--ssh-host', help='SSH host (for scp method)')
    parser.add_argument('--ssh-user', help='SSH user (for scp method)')
    parser.add_argument('--wp-path', default='/var/www/html', help='WordPress path on server')
    
    args = parser.parse_args()
    
    print("╔════════════════════════════════════════════════════════╗")
    print("║  Bedcave Next.js → WordPress Auto-Deploy               ║")
    print("╚════════════════════════════════════════════════════════╝\n")
    
    # Validate theme file exists
    if not os.path.exists(args.theme):
        print(f"✗ Theme file not found: {args.theme}")
        print("Run: ./deploy-to-wordpress.sh first")
        sys.exit(1)
    
    deployer = WordPressDeployer(args.url, args.user, args.password)
    
    # Test connection
    if not deployer.test_connection():
        print("\n⚠️  API nicht erreichbar. Alternative Methoden:")
        print("   1. Manuelles Upload im WordPress Admin")
        print("   2. SSH/SCP Upload")
        print("   3. FTP Upload")
        sys.exit(1)
    
    if args.method == 'api':
        if not args.user or not args.password:
            print("✗ Für API-Methode: --user und --pass erforderlich")
            sys.exit(1)
        
        success = deployer.upload_via_api(args.theme)
        if not success:
            print("\n📋 Alternative: PHP Installer Methode")
            deployer.generate_install_php(args.theme)
    
    elif args.method == 'php':
        # Generate PHP installer for manual upload
        installer_path, secret = deployer.generate_install_php(args.theme)
        
        print(f"\n📦 Dateien zum Upload:")
        print(f"   - {args.theme}")
        print(f"   - {installer_path}")
        
        # Option to auto-upload via SSH if credentials provided
        if args.ssh_host and args.ssh_user:
            print(f"\n🚀 SSH Upload wird durchgeführt...")
            scp_command = f"""
scp {args.theme} {installer_path} {args.ssh_user}@{args.ssh_host}:{args.wp_path}/
"""
            print(f"Befehl: {scp_command}")
            print("Bitte manuell ausführen oder SSH-Key konfigurieren")
    
    elif args.method == 'scp':
        if not args.ssh_host or not args.ssh_user:
            print("✗ Für SCP-Methode: --ssh-host und --ssh-user erforderlich")
            sys.exit(1)
        
        import subprocess
        
        theme_dest = f"{args.ssh_user}@{args.ssh_host}:{args.wp_path}/wp-content/themes/"
        
        print(f"📤 Upload via SCP zu {theme_dest}...")
        
        # Extract and upload
        extract_dir = Path(args.theme).parent / 'theme-extract'
        extract_dir.mkdir(exist_ok=True)
        
        with zipfile.ZipFile(args.theme, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # SCP upload
        scp_cmd = [
            'scp', '-r',
            str(extract_dir / 'bedcave-nextjs'),
            theme_dest
        ]
        
        result = subprocess.run(scp_cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✓ Upload erfolgreich!")
            print(f"✓ Theme in WordPress aktivieren: {args.url}/wp-admin/themes.php")
        else:
            print(f"✗ SCP fehlgeschlagen: {result.stderr}")

if __name__ == '__main__':
    main()
