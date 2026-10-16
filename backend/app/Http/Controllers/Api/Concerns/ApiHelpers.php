<?php

namespace App\Http\Controllers\Api\Concerns;

use App\Models\Land;
use App\Models\OwnershipTransfer;
use App\Models\Store;
use App\Models\User;
use Illuminate\Support\Collection;
use MongoDB\Laravel\Eloquent\Casts\ObjectId as CastsObjectId;

/**
 * Small helpers shared by the controllers.
 * Every document is sent to the React app with a plain string "id" (it never sees an ObjectId).
 */
trait ApiHelpers
{
    protected function shape($model): array
    {
        $data = $model->toArray();
        $data['id'] = (string) $model->getKey();
        unset($data['_id']);

        return $data;
    }

    protected function shapeAll($models): array
    {
        return collect($models)->map(fn($m) => $this->shape($m))->values()->all();
    }

    /** The transfers of one land, oldest first. */
    protected function chainRows(Land $land): Collection
    {
        return OwnershipTransfer::where('land_id', (string) $land->getKey())
            ->orderBy('date')
            ->orderBy('created_at')
            ->get()
            ->values();
    }

    /** Ownership record as the app shows it: [{ owner, date, note }] */
    protected function formatChain(iterable $rows): array
    {
        return collect($rows)
            ->map(fn($t) => ['owner' => $t->to_owner, 'date' => $t->date, 'note' => $t->note])
            ->values()
            ->all();
    }

    protected function chainFor(Land $land): array
    {
        return $this->formatChain($this->chainRows($land));
    }

    protected function landPayload(Land $land, bool $withChain = false): array
    {
        $data = $this->shape($land);

        if ($withChain) {
            $data['chain'] = $this->chainFor($land);
        }

        return $data;
    }

    /** Lands keyed by id, used to attach the land to inquiries and saved lists. */
    protected function landsById(iterable $ids): Collection
    {
        // Build real ObjectIds ourselves, so this works whether or not the library converts strings.
        $objectIds = collect($ids)
            ->filter(fn($id) => is_string($id) && preg_match('/^[a-f0-9]{24}$/i', $id))
            ->unique()
            ->map(fn($id) => new CastsObjectId($id))
            ->values()
            ->all();

        if (! $objectIds) {
            return collect();
        }

        return Land::whereIn('_id', $objectIds)->get()->keyBy(fn($l) => (string) $l->getKey());
    }

    protected function userId(): string
    {
        return (string) request()->user()->getKey();
    }

    /**
     * The seller's store. Created the first time it is needed, so registering as a seller,
     * choosing "seller" later, and sellers from before stores existed all end up the same way.
     */
    protected function storeFor(User $user, ?string $name = null): Store
    {
        return Store::firstOrCreate(
            ['owner_id' => (string) $user->getKey()],
            [
                'name'     => trim((string) $name) ?: $user->name,
                'type'     => 'Owner',
                'district' => 'Kathmandu',
                'phone'    => $user->phone ?? '',
                'email'    => $user->email,
                'about'    => '',
                'since'    => (int) date('Y'),
            ]
        );
    }
}
