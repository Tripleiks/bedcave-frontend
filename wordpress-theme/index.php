<?php
/**
 * Template Name: Fallback
 * Fallback template when no static file exists
 */
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
</head>
<body>
    <div style="max-width: 800px; margin: 50px auto; text-align: center; font-family: monospace;">
        <h1 style="color: #00d4ff;">🚀 Next.js Frontend</h1>
        <p>Static files not found. Please deploy the Next.js build.</p>
        <p>Run: <code style="background: #1e293b; padding: 4px 8px; border-radius: 4px;">npm run export</code></p>
    </div>
    <?php wp_footer(); ?>
</body>
</html>
