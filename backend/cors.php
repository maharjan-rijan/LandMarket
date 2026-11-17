<?php

// config/cors.php  (replace the file with this)
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],

    // FRONTEND_URL = the address testers open, for example https://landmarket.vercel.app
    // (no slash at the end). Add more addresses separated by commas.
    'allowed_origins' => array_filter(array_map('trim', explode(',', env('FRONTEND_URL', 'http://localhost:5173')))),

    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false, // bearer tokens, no cookies
];
