<?php
/**
 * Theme Name: Bedcave NextJS Frontend
 * Theme URI: https://bedcave.com
 * Description: Next.js Static Export Integration Theme
 * Version: 1.0.0
 * Author: Bedcave
 * Text Domain: bedcave-nextjs
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Serve Next.js static files for frontend routes
 */
add_action('template_redirect', 'bedcave_nextjs_serve_static', 1);

function bedcave_nextjs_serve_static() {
    // Skip for admin, login, and API routes
    if (is_admin() || 
        strpos($_SERVER['REQUEST_URI'], '/wp-login') !== false ||
        strpos($_SERVER['REQUEST_URI'], '/wp-admin') !== false ||
        strpos($_SERVER['REQUEST_URI'], '/wp-json') !== false ||
        strpos($_SERVER['REQUEST_URI'], '/xmlrpc.php') !== false) {
        return;
    }
    
    $static_dir = get_template_directory() . '/nextjs-static/';
    $request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $request_path = trim($request_uri, '/');
    
    // Map WordPress routes to Next.js static files
    $file_map = [
        '' => 'index.html',
        '/' => 'index.html',
    ];
    
    // Check if this is a post/page slug
    $target_file = $file_map[$request_path] ?? null;
    
    if (!$target_file && !empty($request_path)) {
        // Try to find HTML file for this slug
        $slug_parts = explode('/', $request_path);
        $slug = end($slug_parts);
        
        // Check for [slug].html
        if (file_exists($static_dir . $slug . '.html')) {
            $target_file = $slug . '.html';
        }
        // Check for nested path
        elseif (file_exists($static_dir . $request_path . '/index.html')) {
            $target_file = $request_path . '/index.html';
        }
        elseif (file_exists($static_dir . $request_path . '.html')) {
            $target_file = $request_path . '.html';
        }
    }
    
    // Serve static file if found
    if ($target_file && file_exists($static_dir . $target_file)) {
        // Set proper headers
        header('Content-Type: text/html; charset=utf-8');
        header('X-Frame-Options: SAMEORIGIN');
        
        // Output the static file
        readfile($static_dir . $target_file);
        exit;
    }
    
    // If no static file found, let WordPress handle it (404 or fallback)
}

/**
 * Enqueue Next.js assets
 */
add_action('wp_enqueue_scripts', 'bedcave_nextjs_enqueue_assets');

function bedcave_nextjs_enqueue_assets() {
    // Only on frontend
    if (is_admin()) return;
    
    $static_url = get_template_directory_uri() . '/nextjs-static/';
    
    // Find and enqueue CSS files
    $css_files = glob(get_template_directory() . '/nextjs-static/_next/static/css/*.css');
    foreach ($css_files as $css_file) {
        $css_filename = basename($css_file);
        wp_enqueue_style(
            'bedcave-nextjs-css-' . sanitize_file_name($css_filename),
            $static_url . '_next/static/css/' . $css_filename,
            [],
            filemtime($css_file)
        );
    }
    
    // Find and enqueue JS files
    $js_files = glob(get_template_directory() . '/nextjs-static/_next/static/chunks/*.js');
    foreach ($js_files as $js_file) {
        $js_filename = basename($js_file);
        wp_enqueue_script(
            'bedcave-nextjs-js-' . sanitize_file_name($js_filename),
            $static_url . '_next/static/chunks/' . $js_filename,
            [],
            filemtime($js_file),
            true
        );
    }
}

/**
 * Add CORS headers for REST API
 */
add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($served, $result, $request, $server) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type');
        return $served;
    }, 10, 4);
});

/**
 * Admin notice for deployment status
 */
add_action('admin_notices', 'bedcave_nextjs_admin_notice');

function bedcave_nextjs_admin_notice() {
    $static_dir = get_template_directory() . '/nextjs-static/';
    
    if (!file_exists($static_dir . 'index.html')) {
        echo '<div class="notice notice-warning is-dismissible">';
        echo '<p><strong>Bedcave NextJS Theme:</strong> No static files found. Please run <code>npm run export</code> and upload files to theme directory.</p>';
        echo '</div>';
    }
}
