<?php

namespace App\Services;

use App\Models\Land;
use Illuminate\Support\Facades\Http;


class ChatbotService
{
    private const MAX_ROUNDS = 4;

    private const DISTRICTS = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan'];

    /** @return array{reply: string, lands: array} */
    public function reply(array $messages, ?string $role): array
    {
        $found = [];

        for ($round = 0; $round < self::MAX_ROUNDS; $round++) {
            $res = Http::withHeaders([
                'x-api-key' => config('services.anthropic.key'),
                'anthropic-version' => '2023-06-01',
            ])->timeout(45)->post('https://api.anthropic.com/v1/messages', [
                'model' => config('services.anthropic.model'),
                'max_tokens' => 700,
                'system' => $this->system($role),
                'tools' => [$this->searchTool()],
                'messages' => $messages,
            ]);

            if ($res->failed()) {
                logger()->error('Claude API error', ['status' => $res->status(), 'body' => $res->body()]);
                throw new \RuntimeException('The assistant is unavailable right now.');
            }

            $content = $res->json('content') ?? [];

            if ($res->json('stop_reason') !== 'tool_use') {
                $text = collect($content)->where('type', 'text')->pluck('text')->implode("\n");
                return ['reply' => trim($text) ?: 'Sorry, I could not answer that.', 'lands' => array_values($found)];
            }

            // Claude asked to search: run it, hand the results back, and let Claude finish its answer.
            $messages[] = ['role' => 'assistant', 'content' => $content];
            $results = [];
            foreach ($content as $block) {
                if (($block['type'] ?? '') !== 'tool_use') {
                    continue;
                }
                $lands = $this->searchLands($block['input'] ?? []);
                foreach ($lands as $l) {
                    $found[$l['id']] = $l;
                }
                $results[] = [
                    'type' => 'tool_result',
                    'tool_use_id' => $block['id'],
                    'content' => json_encode($lands ?: 'No active listings match.'),
                ];
            }
            $messages[] = ['role' => 'user', 'content' => $results];
        }

        return ['reply' => 'Sorry, that took too long. Please try a simpler question.', 'lands' => array_values($found)];
    }

    private function searchLands(array $in): array
    {
        $q = Land::where('status', 'active');

        if (!empty($in['district']) && in_array($in['district'], self::DISTRICTS, true)) {
            $q->where('district', $in['district']);
        }
        if (!empty($in['max_price_per_aana'])) {
            $q->where('pricePerAana', '<=', (float) $in['max_price_per_aana']);
        }
        if (!empty($in['min_area_aana'])) {
            $q->where('areaAana', '>=', (float) $in['min_area_aana']);
        }

        return $q->orderBy('pricePerAana')->limit(5)->get()->map(fn($l) => [
            'id' => (string) $l->getKey(),
            'title' => $l->title,
            'district' => $l->district,
            'municipality' => $l->municipality,
            'areaAana' => $l->areaAana,
            'pricePerAana' => $l->pricePerAana,
        ])->all();
    }

    private function searchTool(): array
    {
        return [
            'name' => 'search_lands',
            'description' => 'Search active land listings on LandMarket. Use it whenever the person wants to find or compare plots. Prices are in Nepali rupees (NPR) per aana.',
            'input_schema' => [
                'type' => 'object',
                'properties' => [
                    'district' => ['type' => 'string', 'enum' => self::DISTRICTS],
                    'max_price_per_aana' => ['type' => 'number', 'description' => 'Highest price per aana in NPR'],
                    'min_area_aana' => ['type' => 'number', 'description' => 'Smallest size in aana'],
                ],
            ],
        ];
    }

    private function system(?string $role): string
    {
        $who = $role ? "The person is logged in as a {$role}." : 'The person is not logged in.';

        return <<<TXT
You are the LandMarket assistant for a Nepal land marketplace. {$who}
Be brief and friendly: 2-4 short sentences, plain text, no markdown.

You help with:
- Finding land: call search_lands. Never invent listings, prices or sizes. The plots you found are shown to the person as cards, so do not repeat every detail; summarise.
- How the site works: anyone can browse Lands and Sellers. After registering you can verify your email (a code is sent), reset a forgotten password by emailed code, and use the Area Converter page. Buyers save lands, send inquiries to sellers, post demands (what they want) and see Purchases. Sellers add and manage listings (mark sold, close, reopen, delete), answer inquiries and see buyer demands. Admins manage users and listings.
- Land buying in Nepal (general guidance only): 1 ropani = 16 aana, 1 aana = 4 paisa; check the lalpurja (land ownership certificate), the trace map (naksa), tax clearance and a land revenue (Malpot) office visit before paying; meet the seller and confirm identity. You are not a lawyer: for legal or tax decisions, advise a licensed lawyer and the local land revenue office.

If asked something unrelated to land or this site, politely say you can only help with LandMarket and land questions. Never ask for passwords or codes.
TXT;
    }
}
