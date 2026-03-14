<?php
// WordPress Theme Auto-Installer
// Upload this file to WordPress root, call via browser, then DELETE!

$key = $_GET['key'] ?? '';
if ($key !== '9056aadbf6a7ce7c3c65d2028281f5ee') {
    die('Unauthorized');
}

require_once('wp-load.php');

if (!current_user_can('install_themes')) {
    die('Insufficient permissions');
}

$file = $_FILES['theme'] ?? null;
if (!$file) {
    echo '<h2>Bedcave Theme Installer</h2>';
    echo '<form method="post" enctype="multipart/form-data">';
    echo '<input type="file" name="theme" accept=".zip" required><br><br>';
    echo '<button type="submit">Install & Activate Theme</button>';
    echo '</form>';
    exit;
}

require_once(ABSPATH . 'wp-admin/includes/class-wp-upgrader.php');
require_once(ABSPATH . 'wp-admin/includes/theme.php');

$upgrader = new Theme_Upgrader();
$result = $upgrader->install($file['tmp_name']);

if ($result === true) {
    echo "✓ Theme installed!<br>";
    switch_theme('bedcave-nextjs');
    echo "✓ Theme activated!<br>";
    echo "<br>Delete this file: theme-installer.php";
    unlink(__FILE__);
} else {
    echo "✗ Error: " . print_r($result, true);
}
