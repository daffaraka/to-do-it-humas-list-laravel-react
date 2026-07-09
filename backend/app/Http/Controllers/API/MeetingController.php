<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function index()
    {
        $meetings = Meeting::orderBy('meeting_date_start', 'asc')->get();
        return response()->json($meetings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'meeting_name' => 'required|string|max:255',
            'meeting_description' => 'nullable|string',
            'meeting_notes' => 'nullable|string',
            'meeting_date_start' => 'nullable|date',
            'meeting_document' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240', // 10MB max
        ]);

        if ($request->hasFile('meeting_document')) {
            $data['meeting_document'] = $request->file('meeting_document')->store('meetings', 'public');
        }

        $meeting = Meeting::create($data);
        return response()->json($meeting, 201);
    }

    public function show($id)
    {
        $meeting = Meeting::findOrFail($id);
        return response()->json($meeting);
    }

    public function update(Request $request, $id)
    {
        $meeting = Meeting::findOrFail($id);
        
        $data = $request->validate([
            'meeting_name' => 'sometimes|required|string|max:255',
            'meeting_description' => 'nullable|string',
            'meeting_notes' => 'nullable|string',
            'meeting_date_start' => 'nullable|date',
            // File upload logic for update needs special care. It's often sent as multipart/form-data.
            'meeting_document' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240',
        ]);

        if ($request->hasFile('meeting_document')) {
            $data['meeting_document'] = $request->file('meeting_document')->store('meetings', 'public');
        }

        $meeting->update($data);
        return response()->json($meeting);
    }

    public function destroy($id)
    {
        $meeting = Meeting::findOrFail($id);
        $meeting->delete();
        return response()->json(['message' => 'Meeting deleted successfully']);
    }
}
