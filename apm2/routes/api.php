<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectProposalController;
use Illuminate\Support\Facades\Route;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Http;
// مسارات عامة بدون حماية
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// مسارات محمية تحتاج إلى Access Token
Route::middleware('auth:api')->group(function () {
    // مسارات المستخدم
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'userProfile']);
    Route::post('/refresh', [AuthController::class, 'refreshToken']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::delete('/profile/delete', [AuthController::class, 'deleteAccount']);
    Route::post('/profile/restore/{id?}', [AuthController::class, 'restoreAccount']);
    
    // مسارات المنسق
    Route::get('/admin/trash', [AuthController::class, 'viewTrash']);
    Route::delete('/admin/trash/{id}', [AuthController::class, 'forceDeleteAccount']);
    Route::put('/admin/user/role/{id}', [AuthController::class, 'changeRole']);

    // مسارات مقترحات المشاريع
    Route::prefix('proposals')->group(function () {
        Route::get('/create', [ProjectProposalController::class, 'create']);
        Route::post('/', [ProjectProposalController::class, 'store']);
        Route::get('/{proposal}', [ProjectProposalController::class, 'show']);
    });
    
    Route::get('/test-deepseek', function () {
        // النص الذي تريد اختصاره
        $textToSummarize = "تمثل المشاريع الأكاديمية جزءا مهما من التعليم العالي , حيث تتيح للطلاب تطبيق المعرفة وتطوير المهارات البحثية . لكن تبرز العديد من التحديات التي تستدعي نظاما لإدارة هذه المشاريع بكفاءة . أحد التحديات هو متابعة تقدم المشروع وتقييم الأداء في كل مرحلة , مما يجعل مراقبة التزام الفرق بالخطة الزمنية أمرا صعبا . كذلك يؤدي غياب منصة موحدة للتواصل إلى صعوبات في تنظيم المناقشات وتوزيع المهام بين أعضاء الفريق والمشرفين . يضاف إلى ذلك نقص الموارد التعليمية المتاحة , مما يعوق وصول الطلاب إلى الأدوات والمراجع اللازمة.";
    
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.deepseek.api_key'),
                'Content-Type' => 'application/json',
            ])->post('https://api.deepseek.com/v1/chat/completions', [
                'model' => 'deepseek-chat',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => "لخص هذا النص في 3 جمل مركزة:\n" . $textToSummarize
                    ]
                ],
                'max_tokens' => 150,
                'temperature' => 0.7,
            ]);
    
            $result = $response->json();
    
            // تسجيل الاستجابة للسجلات (تم التعديل هنا)
            if ($result) {
                \Log::debug('DeepSeek API Response', ['response' => $result]);
            }
    
            if (isset($result['choices'][0]['message']['content'])) {
                return response()->json([
                    'original_text' => $textToSummarize,
                    'summary' => $result['choices'][0]['message']['content'],
                    'full_response' => $result // إظهار الرد الكامل لأغراض التصحيح
                ]);
            }
    
            return response()->json([
                'error' => 'No content in response',
                'response' => $result
            ], 500);
    
        } catch (\Exception $e) {
            \Log::error('DeepSeek API Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    });
    Route::get('/test-deepseek-connection', function() {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.deepseek.api_key'),
            ])->get('https://api.deepseek.com/v1/models');
            
            return $response->json();
        } catch (\Exception $e) {
            return [
                'error' => $e->getMessage(),
                'details' => 'تأكد من اتصال الإنترنت وعدم حظر API'
            ];
        }
    });
});