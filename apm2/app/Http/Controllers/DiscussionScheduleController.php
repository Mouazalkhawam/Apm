<?php 
namespace App\Http\Controllers;

use App\Models\DiscussionSchedule;
use Illuminate\Http\Request;

class DiscussionScheduleController extends Controller
{
    public function store(Request $request)
    {
        // تحقق إن المستخدم كوردنيتور
        if (auth()->user()->role !== 'coordinator') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'type' => 'required|in:مرحلية,تحليلية,نهائية',
        ]);

        $schedule = DiscussionSchedule::create($validated);

        return response()->json(['schedule' => $schedule], 201);
    }

    public function index()
    {
        return DiscussionSchedule::all();
    }
}
