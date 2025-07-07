<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Skill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class StudentProfileController extends Controller
{
    // تحديث الملف الشخصي (نص فقط للخبرة)
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;
    
        $validator = Validator::make($request->all(), [
            'university_number' => 'nullable|string|max:20|unique:students,university_number,' . $student->studentId . ',studentId',
            'major' => 'nullable|string|max:100',
            'academic_year' => 'nullable|integer|min:1|max:5',
            'experience' => 'nullable|string', // تغيير من array إلى string
            'gpa' => 'nullable|numeric|min:0|max:4.00',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $student->update($request->only([
            'university_number',
            'major',
            'academic_year',
            'experience',
            'gpa'
        ]));
    
        return response()->json([
            'success' => true,
            'message' => 'تم تحديث الملف الشخصي بنجاح!',
            'data' => $student->fresh()
        ]);
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
            'message' => 'تمت إضافة المهارة بنجاح!'
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
            'message' => 'تمت إزالة المهارة بنجاح!'
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