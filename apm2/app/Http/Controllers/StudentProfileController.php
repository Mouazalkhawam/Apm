<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class StudentProfileController extends Controller
{
    // تحديث الملف الشخصي مع دعم الوسائط المتعددة
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;
    
        $validator = Validator::make($request->all(), [
            'university_number' => 'nullable|string|max:20|unique:students,university_number,' . $student->studentId . ',studentId',
            'major' => 'nullable|string|max:100',
            'academic_year' => 'nullable|integer|min:1|max:5',
            'experience' => 'nullable|array',
            'experience.*.type' => 'required_with:experience|in:text,image,video',
            'experience.*.content' => 'required_with:experience',
            'gpa' => 'nullable|numeric|min:0|max:4.00',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'university_number',
            'major',
            'academic_year',
            'gpa'
        ]);

        // معالجة الخبرات إذا كانت موجودة
        if ($request->has('experience')) {
            $processedExperience = $this->processExperience($request->experience);
            $data['experience'] = $processedExperience;
        }
    
        $student->update($data);
    
        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الملف الشخصي!',
            'data' => $student->fresh()
        ]);
    }

    // معالجة بيانات الخبرة (رفع الصور، تحقق من الفيديوهات، إلخ)
    private function processExperience(array $experienceItems)
    {
        $processed = [];
        
        foreach ($experienceItems as $item) {
            try {
                $processedItem = [
                    'type' => $item['type'],
                    'created_at' => now()->toDateTimeString()
                ];

                // معالجة الصور
                if ($item['type'] === 'image') {
                    if (str_starts_with($item['content'], 'data:image')) {
                        $imagePath = $this->storeBase64Image($item['content']);
                        if ($imagePath) {
                            $processedItem['content'] = $imagePath;
                        } else {
                            continue; // تخطي إذا فشل تحميل الصورة
                        }
                    } else {
                        $processedItem['content'] = $item['content']; // روابط صور موجودة
                    }
                }
                // معالجة الفيديو
                elseif ($item['type'] === 'video') {
                    $processedItem['content'] = $this->validateVideoUrl($item['content']);
                }
                // معالجة النص
                else {
                    $processedItem['content'] = $item['content'];
                }

                $processed[] = $processedItem;
            } catch (\Exception $e) {
                \Log::error('Error processing experience item: ' . $e->getMessage());
                continue;
            }
        }

        return $processed;
    }
    // تخزين الصور بصيغة Base64
    private function storeBase64Image($base64Image)
    {
        try {
            $imageData = explode(',', $base64Image);
            $imageInfo = explode(';', explode(':', $imageData[0])[1]);
            $imageType = explode('/', $imageInfo[0])[1]; // هنا نأخذ العنصر الأول فقط
            
            $imageName = 'experience/' . uniqid() . '.' . $imageType;
            
            Storage::disk('public')->put($imageName, base64_decode($imageData[1]));
            
            return Storage::url($imageName);
        } catch (\Exception $e) {
            \Log::error('Failed to store base64 image: ' . $e->getMessage());
            return null;
        }
    }
    // تحقق من روابط الفيديو
    private function validateVideoUrl($url)
    {
        $parsedUrl = parse_url($url);
        
        // مثال للتحقق من روابط يوتيوب
        if (isset($parsedUrl['host']) && str_contains($parsedUrl['host'], 'youtube.com')) {
            parse_str($parsedUrl['query'] ?? '', $query);
            return 'https://www.youtube.com/embed/' . ($query['v'] ?? '');
        }
        
        return $url;
    }

    // إضافة مهارة للطالب
    public function addSkill(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'skill_id' => 'required|exists:skills,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $student = $user->student;

        if (!$student->skills()->where('skill_id', $request->skill_id)->exists()) {
            $student->skills()->attach($request->skill_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'تمت إضافة المهارة!'
        ]);
    }

    // إزالة مهارة من الطالب
    public function removeSkill($skillId)
    {
        $user = Auth::user();
        $student = $user->student;

        $student->skills()->detach($skillId);

        return response()->json([
            'success' => true,
            'message' => 'تمت إزالة المهارة!'
        ]);
    }

    // عرض مهارات الطالب
    public function getSkills()
    {
        $user = Auth::user();
        $skills = $user->student->skills;

        return response()->json([
            'success' => true,
            'data' => $skills
        ]);
    }

    // جلب جميع المهارات المتاحة
    public function getAllSkills()
    {
        $skills = Skill::all(['id', 'name']);
        return response()->json([
            'success' => true,
            'data' => $skills
        ]);
    }

    // جلب بيانات الملف الشخصي
    public function getProfile()
    {
        $student = Auth::user()->student;
        
        return response()->json([
            'success' => true,
            'data' => [
                'university_number' => $student->university_number,
                'major' => $student->major,
                'academic_year' => $student->academic_year,
                'gpa' => $student->gpa,
                'experience' => $student->experience,
                'skills' => $student->skills
            ]
        ]);
    }
}