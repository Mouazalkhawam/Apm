<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    use HasFactory;
    // app/Models/Resource.php

    protected $primaryKey = 'resourceId';
    protected $fillable = [
        'title',
        'description',
        'type',
        'filePath',
        'link',
        'created_by',
        'status',
        'reviewed_by',
        'reviewed_at',
        'notes'
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by', 'userId');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'userId');
    }
}
