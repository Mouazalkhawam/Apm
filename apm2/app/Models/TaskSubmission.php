<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaskSubmission extends Model
{
    protected $fillable = [
        'task_id',
        'studentId',
        'content',
        'github_repo',
        'github_commit_url',
        'commit_description',
        'attachment_path',
        'attachment_name',
        'attachment_size',
        'feedback',
        'grade'
    ];

    // الحد الأقصى لحجم الملف (10MB)
    const MAX_FILE_SIZE = 10485760; // 10MB in bytes

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'studentId');
    }

    // دالة للتحقق من وجود مرفق
    public function hasAttachment()
    {
        return !empty($this->attachment_path);
    }

    // دالة للحصول على حجم الملف بشكل مقروء
    public function getFormattedFileSize()
    {
        if (!$this->attachment_size) return null;
        
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = $this->attachment_size;
        $unit = floor(log($bytes, 1024));
        
        return round($bytes / pow(1024, $unit), 2) . ' ' . $units[$unit];
    }
    public function getAttachmentUrlAttribute()
    {
        if (!$this->attachment_path) {
            return null;
        }
        return asset('storage/' . $this->attachment_path);
    }
}