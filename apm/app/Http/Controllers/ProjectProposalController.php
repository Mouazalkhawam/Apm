<?php

namespace App\Http\Controllers;

use App\Models\ProjectProposal;
use App\Models\Student;
use App\Models\Supervisor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProjectProposalController extends Controller
{
    public function create()
    {
        $student = Student::where('userId', Auth::id())->firstOrFail();
        $students = Student::where('userId', '!=', Auth::id())->get();
        $supervisors = Supervisor::all();

        return response()->json([
            'student' => $student,
            'students' => $students,
            'supervisors' => $supervisors
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    public function store(Request $request)
    {
        $validated = $this->validateRequest($request);
        $mindmapPath = $this->handleFileUpload($request);

        $proposalData = [
            'leader_id' => Student::where('userId', Auth::id())->first()->studentId,
            'title' => $validated['title'],
            'problem_mindmap_path' => $mindmapPath,
            'problem_statement' => $validated['problem_statement'],
            'problem_background' => $validated['problem_background'],
            'proposed_solution' => $validated['proposed_solution'],
            'functional_requirements' => $validated['functional_requirements'],
            'non_functional_requirements' => $validated['non_functional_requirements'],
            'methodology' => 'Agile',
            'technology_stack' => $validated['tech_stack'] ?? [],
        ];

        $proposal = ProjectProposal::create($proposalData);
        $this->attachRelations($proposal, $request);

        return response()->json([
            'message' => 'تم تقديم المقترح بنجاح!',
            'data' => $this->prepareResponseData($proposal, $mindmapPath)
        ], 201, [], JSON_UNESCAPED_UNICODE);
    }

    private function validateRequest(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'problem_statement' => 'required|string',
            'problem_background' => 'required|string',
            'problem_mindmap' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'proposed_solution' => 'required|string',
            'functional_requirements' => 'required|string',
            'non_functional_requirements' => 'required|string',
            'team_members' => 'nullable|array',
            'team_members.*' => 'exists:students,studentId',
            'supervisors' => 'nullable|array',
            'supervisors.*' => 'exists:supervisors,supervisorId',
            'experts' => 'nullable|array',
            'experts.*.name' => 'required_with:experts|string',
            'experts.*.phone' => 'nullable|string',
            'tech_stack' => 'nullable|array',
        ]);
    }

    private function handleFileUpload(Request $request): ?string
    {
        if (!$request->hasFile('problem_mindmap')) {
            return null;
        }

        try {
            return $request->file('problem_mindmap')->store('mindmaps', 'public');
        } catch (\Exception $e) {
            Log::error('File upload failed: ' . $e->getMessage());
            return null;
        }
    }

    private function attachRelations(ProjectProposal $proposal, Request $request): void
    {
        try {
            if ($request->team_members) {
                $proposal->teamMembers()->attach($request->team_members);
            }

            if ($request->supervisors) {
                $proposal->supervisors()->attach($request->supervisors);
            }

            if ($request->experts) {
                foreach ($request->experts as $expert) {
                    if (!empty($expert['name'])) {
                        $proposal->experts()->create([
                            'name' => $expert['name'],
                            'phone' => $expert['phone'] ?? null,
                            'specialization' => $expert['specialization'] ?? null,
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Relations attachment failed: ' . $e->getMessage());
        }
    }

    private function prepareResponseData(ProjectProposal $proposal, ?string $mindmapPath): array
    {
        return [
            'proposal_id' => $proposal->proposalId,
            'title' => $proposal->title,
            'mindmap_url' => $mindmapPath ? url('storage/' . $mindmapPath) : null,
            'view_url' => url("/api/proposals/{$proposal->proposalId}")
        ];
    }

    public function show($id)
    {
        $proposal = ProjectProposal::with([
            'leader.user',
            'teamMembers.user',
            'supervisors.user',
            'experts'
        ])->findOrFail($id);

        return response()->json([
            'data' => $this->formatProposalData($proposal)
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    private function formatProposalData(ProjectProposal $proposal): array
    {
        return [
            'proposalId' => $proposal->proposalId,
            'title' => $proposal->title,
            'problem_statement' => $proposal->problem_statement,
            'problem_background' => $proposal->problem_background,
            'proposed_solution' => $proposal->proposed_solution,
            'functional_requirements' => $proposal->functional_requirements,
            'non_functional_requirements' => $proposal->non_functional_requirements,
            'methodology' => $proposal->methodology,
            'technology_stack' => $proposal->technology_stack,
            'leader' => $proposal->leader,
            'team_members' => $proposal->teamMembers,
            'supervisors' => $proposal->supervisors,
            'experts' => $proposal->experts,
            'mindmap_url' => $proposal->problem_mindmap_path ? url('storage/' . $proposal->problem_mindmap_path) : null
        ];
    }
}