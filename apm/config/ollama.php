<?php

return [
    'path' => env('OLLAMA_PATH', 'ollama'), // المسار الافتراضي إذا لم يتم تحديده في .env
    'model' => env('OLLAMA_MODEL', 'llama3'), // النموذج الافتراضي
    'timeout' => env('OLLAMA_TIMEOUT', 300), // المهلة الافتراضية بالثواني
];