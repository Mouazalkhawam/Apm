<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class StudentProfileController extends Controller
{
    // ✅ تحديث الخبرة والمعدل
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        $validator = Validator::make($request->all(), [
            'experience' => 'nullable|string|max:1000',
            'gpa' => 'nullable|numeric|min:0|max:4.00',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $student->update($request->only(['experience', 'gpa']));

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الملف الشخصي!',
            'data' => $student
        ]);
    }

    // ✅ إضافة مهارة للطالب
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

        // تجنب التكرار
        if (!$student->skills()->where('skill_id', $request->skill_id)->exists()) {
            $student->skills()->attach($request->skill_id);
        }

        return response()->json([
            'success' => true,
            'message' => 'تمت إضافة المهارة!'
        ]);
    }

    // ✅ إزالة مهارة من الطالب
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

    // ✅ عرض مهارات الطالب
    public function getSkills()
    {
        $user = Auth::user();
        $skills = $user->student->skills;

        return response()->json([
            'success' => true,
            'data' => $skills
        ]);
    }

    // في StudentProfileController.php
    public function getAllSkills()
    {
        $skills = Skill::all(['id', 'name']); // جلب جميع المهارات مع الحقول المطلوبة
        return response()->json([
            'success' => true,
            'data' => $skills
        ]);
    }
}