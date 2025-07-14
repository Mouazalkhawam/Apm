<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class AuthController extends Controller
{
    // ✅ تسجيل حساب جديد (للطلاب فقط)
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => 'student',
        ];

        // إضافة مسار الصورة إذا وجدت
        if ($request->hasFile('profile_picture')) {
            $image = $request->file('profile_picture');
            $imageName = time().'.'.$image->extension();
            $image->move(public_path('images/users'), $imageName);
            $userData['profile_picture'] = 'images/users/'.$imageName;
        }

        $user = User::create($userData);

        Student::create([
            'userId' => $user->userId,
        ]);

        $accessToken = JWTAuth::fromUser($user);
        $refreshToken = JWTAuth::claims(['refresh' => true])->fromUser($user);

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح!',
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ], 201);
    }

    // ✅ تسجيل الدخول
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::withTrashed()->where('email', $request->email)->first();

        if ($user && $user->trashed()) {
            $user->restore();
        }

        if (!$accessToken = JWTAuth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'], 401);
        }

        $user = Auth::user();
        $refreshToken = JWTAuth::claims(['refresh' => true])->fromUser($user);

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح!',
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ], 200);
    }

    // ✅ تعديل الحساب
    public function updateProfile(Request $request)
{
    $user = Auth::user();
    
    $request->validate([
        'name' => 'sometimes|string|max:255',
        'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->userId . ',userId',
        'phone' => 'nullable|string|max:20|unique:users,phone,' . $user->userId . ',userId',
        'password' => 'sometimes|string|min:6|confirmed',
        'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    $data = [
        'name' => $request->name ?? $user->name,
        'email' => $request->email ?? $user->email,
        'phone' => $request->phone ?? $user->phone,
    ];

    // تحديث كلمة المرور إذا تم توفيرها
    if ($request->password) {
        $data['password'] = Hash::make($request->password);
    }

    // معالجة رفع الصورة
    if ($request->hasFile('profile_picture')) {
        // حذف الصورة القديمة إذا كانت موجودة
        if ($user->profile_picture && file_exists(public_path($user->profile_picture))) {
            unlink(public_path($user->profile_picture));
        }
        
        // حفظ الصورة الجديدة بنفس مكان الإنشاء (public/images/users)
        $image = $request->file('profile_picture');
        $imageName = time().'.'.$image->extension();
        $image->move(public_path('images/users'), $imageName);
        $data['profile_picture'] = 'images/users/'.$imageName;
    }

    // تحديث بيانات المستخدم
    $user->update($data);

    return response()->json([
        'success' => true,
        'message' => 'تم تحديث الحساب بنجاح!',
        'user' => $user->fresh()
    ], 200);
}

    // ✅ حذف الحساب (مؤقت أو نهائي)
    public function deleteAccount(Request $request)
    {
        $user = Auth::user();
        $request->validate(['type' => 'required|in:temporary,permanent']);

        if ($user->role === 'coordinator') {
            return response()->json(['message' => 'لا يمكن لمنسق المشاريع حذف نفسه!'], 403);
        }

        if ($request->type === 'permanent') {
            $user->forceDelete();
            return response()->json(['message' => 'تم حذف الحساب نهائيًا.']);
        } else {
            $user->delete();
            return response()->json(['message' => 'تم نقل الحساب إلى سلة المهملات لمدة 15 يومًا.']);
        }
    }

    // ✅ استرجاع حساب من التراش
    public function restoreAccount($id = null)
    {
        $user = Auth::user();

        if ($user->role !== 'coordinator') {
            if (!$user->trashed()) {
                return response()->json(['message' => 'لا يمكن استرجاع الحساب لأنه لم يتم حذفه.'], 400);
            }
            $user->restore();
            return response()->json(['message' => 'تم استرجاع الحساب بنجاح!']);
        }

        if ($id) {
            $trashedUser = User::onlyTrashed()->findOrFail($id);
            $trashedUser->restore();
            return response()->json(['message' => 'تم استرجاع الحساب بنجاح!']);
        }

        return response()->json(['message' => 'يجب تحديد الحساب المراد استرجاعه.'], 400);
    }

    // ✅ عرض سلة المهملات (المنسق فقط)
    public function viewTrash()
    {
        $user = Auth::user();
        if ($user->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح لك بالوصول إلى سلة المهملات.'], 403);
        }

        $trashedUsers = User::onlyTrashed()->get();
        return response()->json($trashedUsers);
    }

    // ✅ حذف حساب من التراش نهائيًا (المنسق فقط)
    public function forceDeleteAccount($id)
    {
        $user = Auth::user();
        if ($user->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح لك بحذف الحسابات من التراش.'], 403);
        }

        $trashedUser = User::onlyTrashed()->findOrFail($id);
        $trashedUser->forceDelete();
        return response()->json(['message' => 'تم حذف الحساب نهائيًا من التراش.']);
    }

    // ✅ تغيير الأدوار (المنسق فقط)
    public function changeRole($id)
    {
        $user = Auth::user();
        if ($user->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح لك بتغيير الأدوار.'], 403);
        }

        $targetUser = User::findOrFail($id);
        if ($targetUser->role !== 'student') {
            return response()->json(['message' => 'يمكن تعديل أدوار الطلاب فقط.'], 403);
        }

        $targetUser->update(['role' => 'alumni']);

        // يمكن تحديث بيانات إضافية في جدول الطلاب هنا إذا أردت (اختياري)

        return response()->json(['message' => 'تم تغيير الدور إلى خريج بنجاح!']);
    }
    // أضف هذه الدالة إلى الكونترولر
    // في AuthController.php
    public function getUsersByRole(Request $request)
    {
        $request->validate([
            'role' => 'required|in:student,supervisor'
        ]);

        $users = User::where('role', $request->role)
                    ->with($request->role)
                    ->get()
                    ->map(function ($user) use ($request) {
                        return [
                            'userId' => $user->userId,
                            'name' => $user->name,
                            'identifier' => $user->{$request->role}->{$request->role . 'Id'} ?? 'N/A'
                        ];
                    });

        return response()->json($users);
    }

    // ✅ تسجيل الخروج
    public function logout(Request $request)
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'تم تسجيل الخروج بنجاح!']);
    }

    // ✅ توليد Access Token جديد باستخدام Refresh Token
    public function refreshToken(Request $request)
    {
        try {
            $newAccessToken = JWTAuth::parseToken()->refresh();
            return response()->json([
                'message' => 'تم تحديث التوكن بنجاح!',
                'access_token' => $newAccessToken,
            ]);
        } catch (JWTException $e) {
            return response()->json(['message' => 'التوكن غير صالح أو منتهي الصلاحية.'], 401);
        }
    }

    // ✅ استرجاع بيانات المستخدم الحالي مع علاقة الطالب
   // ✅ استرجاع بيانات المستخدم الحالي مع علاقة الطالب والمهارات
    public function userProfile(Request $request)
    {
        $user = $request->user()->load(['student', 'student.skills']);
        
        // تحسين عرض بيانات المستخدم
        $response = [
            'userId' => $user->userId,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'profile_picture' => $user->profile_picture 
            ? asset($user->profile_picture) // استخدم asset() بدلاً من storage
            : null,
             'student' => null
        ];

        if ($user->student) {
            $response['student'] = [
                'studentId' => $user->student->studentId,
                'university_number' => $user->student->university_number,
                'major' => $user->student->major,
                'academic_year' => $user->student->academic_year,
                'gpa' => $user->student->gpa,
                'experience' => $user->student->experience,
                'skills' => $user->student->skills->map(function($skill) {
                    return [
                        'skillId' => $skill->id,
                        'name' => $skill->name
                    ];
                })
            ];
        }

        return response()->json($response);
    }

    public function getStudentsForDropdown()
    {
        $students = User::where('role', 'student')
            ->join('students', 'users.userId', '=', 'students.userId')
            ->select('users.userId as id', 'students.studentId', 'users.name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }


    public function getSupervisorsForDropdown()
    {
        $supervisors = User::where('role', 'supervisor')
            ->join('supervisors', 'users.userId', '=', 'supervisors.userId')
            ->select('users.userId as id', 'supervisors.supervisorId', 'users.name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $supervisors
        ]);
    }
    public function checkSupervisor(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isSupervisor()) {
            return response()->json([
                'is_supervisor' => false,
                'message' => 'المستخدم الحالي ليس مشرفًا'
            ]);
        }
        
        return response()->json([
            'is_supervisor' => true,
            'supervisor_id' => $user->supervisor->supervisorId,
            'user_id' => $user->userId,
            'name' => $user->name,
            'email' => $user->email
        ]);
    }
    // ✅ إنشاء حساب مشرف جديد (للمنسق فقط) - بإدخال محدود
public function createSupervisor(Request $request)
{
    // التحقق من أن المستخدم الحالي هو منسق
    $currentUser = Auth::user();
    if ($currentUser->role !== 'coordinator') {
        return response()->json(['message' => 'غير مصرح لك بإنشاء حسابات المشرفين.'], 403);
    }

    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'phone' => 'required|string|max:20|unique:users',
        'password' => 'required|string|min:6|confirmed',
        'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // اختياري
    ]);

    // إنشاء حساب المستخدم
    $userData = [
        'name' => $request->name,
        'email' => $request->email,
        'phone' => $request->phone,
        'password' => Hash::make($request->password),
        'role' => 'supervisor',
    ];

    // معالجة صورة الملف الشخصي (إذا تم رفعها)
    if ($request->hasFile('profile_picture')) {
        $image = $request->file('profile_picture');
        $imageName = time().'.'.$image->extension();
        $image->move(public_path('images/users'), $imageName);
        $userData['profile_picture'] = 'images/users/'.$imageName;
    }

    $user = User::create($userData);

    // إنشاء سجل المشرف مع قيم افتراضية
    $supervisor = \App\Models\Supervisor::create([
        'userId' => $user->userId,
        'specialization' => 'غير محدد',
        'department' => 'غير محدد',
        'position' => 'مشرف',
    ]);

    return response()->json([
        'success' => true,
        'message' => 'تم إنشاء حساب المشرف بنجاح!',
        'user' => $user,
        'supervisor' => $supervisor
    ], 201);
}



// ✅ جلب جميع المنسقين
// ✅ جلب جميع المنسقين (متاح للجميع)
public function getCoordinators()
{
    $coordinators = User::where('role', 'coordinator')
        ->select('userId', 'name', 'email', 'phone', 'profile_picture')
        ->get()
        ->map(function($coordinator) {
            return [
                'userId' => $coordinator->userId,
                'name' => $coordinator->name,
                'email' => $coordinator->email,
                'phone' => $coordinator->phone,
                'profile_picture' => $coordinator->profile_picture 
                    ? asset($coordinator->profile_picture)
                    : null,
            ];
        });

    return response()->json([
        'success' => true,
        'data' => $coordinators
    ]);
}
}
