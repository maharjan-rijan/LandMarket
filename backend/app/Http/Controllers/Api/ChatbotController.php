<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function send(Request $request, ChatbotService $chat): JsonResponse
    {
        $data = $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:20'],
            'messages.*.role' => ['required', 'in:user,assistant'],
            'messages.*.content' => ['required', 'string', 'max:1000'],
        ]);

        $messages = array_map(
            fn ($m) => ['role' => $m['role'], 'content' => $m['content']],
            $data['messages'],
        );

        // Claude needs the conversation to start with, and end on, the person's message.
        if ($messages[0]['role'] !== 'user' || end($messages)['role'] !== 'user') {
            return response()->json(['message' => 'Send your question as the last message.'], 422);
        }

        try {
            // Visitors may chat without logging in; if a token is sent we only use the role.
            $role = $request->user('sanctum')?->role;

            return response()->json($chat->reply($messages, $role));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'The assistant is unavailable right now. Please try again.'], 503);
        }
    }
}
