<?php

namespace Database\Seeders;

use App\Models\Demand;
use App\Models\Inquiry;
use App\Models\Land;
use App\Models\OwnershipTransfer;
use App\Models\SavedLand;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;

/**
 * Development data for the LandMarket multi-vendor marketplace.
 *
 *   php artisan db:seed
 *
 * Run `php artisan migrate` first: the migrations create the indexes.
 *
 * Safe to run again: it only removes documents it created itself (seeded = true),
 * so real accounts you registered through the app are never touched.
 *
 * Every seeded account uses the password: password
 */
class DatabaseSeeder extends Seeder
{
    private const PASSWORD = 'password';

    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->error('Refusing to seed demo data in production.');

            return;
        }

        Model::unguard();

        $this->wipePreviousSeed();

        $admin   = $this->seedAdmin();
        $sellers = $this->seedSellersAndStores();
        $buyers  = $this->seedBuyers();
        $lands   = $this->seedLands($sellers, $buyers);

        $this->seedInquiries($lands, $buyers, $sellers);
        $this->seedSaved($lands, $buyers);
        $this->seedDemands($buyers);

        Model::reguard();

        $this->printSummary($admin, $sellers, $buyers, $lands);
    }

    /* ------------------------------------------------------------------ */
    /* Setup                                                               */
    /* ------------------------------------------------------------------ */

    private function wipePreviousSeed(): void
    {
        foreach ([OwnershipTransfer::class, SavedLand::class, Inquiry::class, Demand::class, Land::class, Store::class, User::class] as $model) {
            $model::where('seeded', true)->delete();
        }
    }

    /* ------------------------------------------------------------------ */
    /* People and stores                                                   */
    /* ------------------------------------------------------------------ */

    private function seedAdmin(): User
    {
        return User::create([
            'name'     => 'LandMarket Admin',
            'email'    => 'admin@landmarket.test',
            'password' => self::PASSWORD,
            'role'     => 'admin',
            'phone'    => '+977 9800000000',
            'seeded'   => true,
        ]);
    }

    /** @return array<string, array{user: User, store: Store}> */
    private function seedSellersAndStores(): array
    {
        $defs = [
            'himal'    => ['Dipak Himal', 'Himal Land Traders', 'Agency', 'Kathmandu', true, 2014, '+977 9800000011', 'Residential and plotting land across the valley. Every listing has its lalpurja and trace map checked before it goes live.'],
            'patan'    => ['Sabina Tamrakar', 'Patan Plot House', 'Agency', 'Lalitpur', true, 2018, '+977 9800000012', 'Small and mid-size plots in Lalitpur, with a focus on 13 to 20 ft road access.'],
            'gandaki'  => ['Roshan Gurung', 'Gandaki Realty', 'Agency', 'Pokhara', true, 2016, '+977 9800000013', 'Hill-view and lakeside-side land around Pokhara for homes and homestays.'],
            'sunita'   => ['Sunita Shrestha', 'Sunita Shrestha', 'Owner', 'Bhaktapur', false, 2025, '+977 9800000014', 'Selling family land in Bhaktapur directly, no agent fees.'],
            'narayani' => ['Bikash Poudel', 'Narayani Land Co.', 'Agency', 'Chitwan', true, 2012, '+977 9800000015', 'Large plots and commercial land around Bharatpur and Ratnanagar.'],
        ];

        $out = [];
        foreach ($defs as $key => [$person, $storeName, $type, $district, $verified, $since, $phone, $about]) {
            $user = User::create([
                'name'     => $person,
                'email'    => "{$key}@landmarket.test",
                'password' => self::PASSWORD,
                'role'     => 'seller',
                'phone'    => $phone,
                'seeded'   => true,
            ]);

            $store = Store::create([
                'owner_id' => $user->id,
                'name'     => $storeName,
                'type'     => $type,
                'district' => $district,
                'phone'    => $phone,
                'email'    => "{$key}@landmarket.test",
                'about'    => $about,
                'verified' => $verified,
                'since'    => $since,
                'seeded'   => true,
            ]);

            $out[$key] = ['user' => $user, 'store' => $store];
        }

        return $out;
    }

    /** @return array<string, User> */
    private function seedBuyers(): array
    {
        $defs = [
            'ram'   => ['Ram Karki', '+977 9800000021'],
            'mina'  => ['Mina Rai', '+977 9800000022'],
            'anil'  => ['Anil Pandey', '+977 9800000023'],
        ];

        $out = [];
        foreach ($defs as $key => [$name, $phone]) {
            $out[$key] = User::create([
                'name'     => $name,
                'email'    => "{$key}@landmarket.test",
                'password' => self::PASSWORD,
                'role'     => 'buyer',
                'phone'    => $phone,
                'seeded'   => true,
            ]);
        }

        return $out;
    }

    /* ------------------------------------------------------------------ */
    /* Lands + ownership history                                           */
    /* ------------------------------------------------------------------ */

    /**
     * @return Land[] keyed by a short slug so the other seeders can refer to them
     */
    private function seedLands(array $sellers, array $buyers): array
    {
        // [slug, store, title, district, municipality, ward, area_aana, price_per_aana, road_ft, facing, extras]
        $rows = [
            ['budha',   'himal',    'Corner plot near Budhanilkantha chowk',   'Kathmandu', 'Budhanilkantha',     7,  5,    5200000, 20, 'South',      ['featured' => true]],
            ['tarake',  'himal',    'Plotting land on a 26 ft road, Tarakeshwar', 'Kathmandu', 'Tarakeshwar',      3,  12,   2600000, 26, 'East',       ['featured' => true]],
            ['dhapa',   'patan',    'Residential plot in Dhapakhel',           'Lalitpur',  'Godawari',            4,  4.25, 3000000, 20, 'West',       ['featured' => true]],
            ['mahala',  'patan',    'Quiet 3 aana plot, Mahalaxmi',            'Lalitpur',  'Mahalaxmi',           9,  3,    3600000, 13, 'North',      []],
            ['surya',   'sunita',   '5 aana land in Suryabinayak',             'Bhaktapur', 'Suryabinayak',        10, 5,    2900000, 13, 'East',       ['verified' => false]],
            ['changu',  'sunita',   'Plotted land near Changunarayan',         'Bhaktapur', 'Changunarayan',       2,  8,    1850000, 16, 'South-East', ['verified' => false]],
            ['pokh1',   'gandaki',  'Hill-view land above Pokhara',            'Pokhara',   'Pokhara Metropolis',  17, 6,    1400000, 20, 'East',       ['featured' => true]],
            ['pokh2',   'gandaki',  '10 aana with Annapurna view',             'Pokhara',   'Pokhara Metropolis',  11, 10,   1100000, 13, 'North-East', []],
            ['bharat',  'narayani', '1 ropani commercial land, Bharatpur',     'Chitwan',   'Bharatpur',           5,  16,   650000,  24, 'South',      ['featured' => true]],
            ['ratna',   'narayani', '2 ropani plot in Ratnanagar',             'Chitwan',   'Ratnanagar',          8,  32,   420000,  20, 'West',       []],
            ['nagar',   'himal',    '5 aana land in Nagarjun',                 'Kathmandu', 'Nagarjun',            6,  5,    2400000, 13, 'East',       []],
            ['daha',    'himal',    '10 aana land in Dahachowk',               'Kathmandu', 'Chandragiri',         1,  10,   3500000, 26, 'North',      []],
            // Sold and closed listings, so those dashboard states have something to show
            ['kirti',   'himal',    '3 aana plot in Kirtipur',                 'Kathmandu', 'Kirtipur',            4,  3,    4200000, 13, 'East',       ['status' => 'sold']],
            ['thimi',   'sunita',   'Plotted land in Madhyapur Thimi',         'Bhaktapur', 'Madhyapur Thimi',     6,  8,    1900000, 16, 'East',       ['views' => 0]],
            ['old',     'narayani', '12 aana in Bharatpur, owner withdrew',    'Chitwan',   'Bharatpur',           9,  12,   700000,  20, 'East',       ['status' => 'closed']],
        ];

        $previousOwners = ['Ram Bahadur Thapa', 'Sita Maharjan', 'Binod Karki', 'Anita Gurung', 'Kiran Shrestha', 'Hari Prasad Adhikari'];

        $lands = [];
        foreach ($rows as $i => [$slug, $storeKey, $title, $district, $municipality, $ward, $area, $price, $road, $facing, $extra]) {
            $store = $sellers[$storeKey]['store'];
            $owner = $sellers[$storeKey]['user'];

            $land = Land::create(array_merge([
                'store_id'       => $store->id,
                'owner_id'       => $owner->id,
                'title'          => $title,
                'district'       => $district,
                'municipality'   => $municipality,
                'ward'           => $ward,
                'area_aana'      => $area,
                'price_per_aana' => $price,
                'road_ft'        => $road,
                'facing'         => $facing,
                'description'    => sprintf(
                    '%s aana of land in %s-%d, %s. %d ft road access, marked boundary pillars and a clear lalpurja.',
                    rtrim(rtrim(number_format($area, 2, '.', ''), '0'), '.'), $municipality, $ward, $district, $road
                ),
                'documents'      => ['Lalpurja', 'Trace map', 'Tax receipt'],
                'status'         => 'active',
                'featured'       => false,
                'verified'       => true,
                'views'          => 90 + (($i + 1) * 37) % 260,
                'seeded'         => true,
            ], $extra));

            // Ownership chain: original holder -> second owner -> the seller listing it
            $this->transfer($land, null, $previousOwners[$i % 6], now()->subYears(15)->toDateString(), 'Original lalpurja holder');
            $this->transfer($land, $previousOwners[$i % 6], $previousOwners[($i + 2) % 6], now()->subYears(7)->toDateString(), 'Bought and registered');
            $this->transfer($land, $previousOwners[($i + 2) % 6], $store->name, now()->subYears(2)->toDateString(), 'Registered to the seller');

            $lands[$slug] = $land;
        }

        // The sold plot: record the sale to a buyer so it shows under "Purchases"
        $buyer = $buyers['ram'];
        $sold  = $lands['kirti'];
        $this->transfer($sold, $sellers['himal']['store']->name, $buyer->name, now()->subDays(40)->toDateString(), 'Sold through LandMarket', (string) $buyer->id);
        $sold->update(['sold_to' => $buyer->id, 'sold_at' => now()->subDays(40)->toDateString()]);

        return $lands;
    }

    private function transfer(Land $land, ?string $from, string $to, string $date, string $note, ?string $toUserId = null): void
    {
        OwnershipTransfer::create([
            'land_id'    => $land->id,
            'from_owner' => $from,
            'to_owner'   => $to,
            'to_user_id' => $toUserId,
            'date'       => $date,
            'note'       => $note,
            'seeded'     => true,
        ]);
    }

    /* ------------------------------------------------------------------ */
    /* Buyer activity                                                      */
    /* ------------------------------------------------------------------ */

    private function seedInquiries(array $lands, array $buyers, array $sellers): void
    {
        // [land, buyer, status, message, days ago]
        $rows = [
            ['budha',  'mina',  'new',     'Is the 20 ft road blacktopped? Can I visit this Saturday?',  0],
            ['budha',  'anil',  'new',     'What is the final price if I pay in full this month?',       1],
            ['dhapa',  'ram',   'replied', 'Is the 20 ft road shared with the neighbouring plot?',       4],
            ['dhapa',  'mina',  'replied', 'Please share the trace map. Is the plot level?',             3],
            ['pokh1',  'ram',   'new',     'Can I visit the land next week?',                            1],
            ['pokh1',  'anil',  'closed',  'Interested, but I need a bank loan first.',                  25],
            ['bharat', 'mina',  'new',     'Is there water and electricity at the plot?',                2],
            ['tarake', 'ram',   'replied', 'Can the 12 aana be split into two plots?',                   6],
        ];

        foreach ($rows as [$landKey, $buyerKey, $status, $message, $daysAgo]) {
            $land  = $lands[$landKey];
            $buyer = $buyers[$buyerKey];

            Inquiry::create([
                'land_id'     => $land->id,
                'store_id'    => $land->store_id,
                'buyer_id'    => $buyer->id,
                'buyer_name'  => $buyer->name,
                'buyer_email' => $buyer->email,
                'buyer_phone' => $buyer->phone,
                'message'     => $message,
                'status'      => $status,
                'seeded'      => true,
                'created_at'  => now()->subDays($daysAgo),
                'updated_at'  => now()->subDays($daysAgo),
            ]);
        }
    }

    private function seedSaved(array $lands, array $buyers): void
    {
        $saves = [
            'ram'  => ['budha', 'dhapa', 'pokh1', 'bharat'],
            'mina' => ['mahala', 'tarake'],
            'anil' => ['pokh2'],
        ];

        foreach ($saves as $buyerKey => $slugs) {
            foreach ($slugs as $slug) {
                SavedLand::create([
                    'user_id' => $buyers[$buyerKey]->id,
                    'land_id' => $lands[$slug]->id,
                    'seeded'  => true,
                ]);
            }
        }
    }

    private function seedDemands(array $buyers): void
    {
        // [buyer, district, min aana, max price per aana, note, status]
        $rows = [
            ['ram',  'Lalitpur',  4,  3500000, 'Road of at least 20 ft and a clear lalpurja.',  'open'],
            ['mina', 'Kathmandu', 5,  3000000, 'For a family home, north of the ring road.',     'open'],
            ['anil', 'Pokhara',   6,  1500000, 'Looking for a homestay site with a view.',       'open'],
            ['ram',  'Chitwan',   16, 700000,  'Commercial use, main road frontage.',            'closed'],
        ];

        foreach ($rows as $i => [$buyerKey, $district, $min, $max, $note, $status]) {
            $buyer = $buyers[$buyerKey];

            Demand::create([
                'buyer_id'           => $buyer->id,
                'buyer_name'         => $buyer->name,
                'phone'              => $buyer->phone,
                'district'           => $district,
                'min_aana'           => $min,
                'max_price_per_aana' => $max,
                'note'               => $note,
                'status'             => $status,
                'seeded'             => true,
                'created_at'         => now()->subDays(3 + $i * 2),
                'updated_at'         => now()->subDays(3 + $i * 2),
            ]);
        }
    }

    /* ------------------------------------------------------------------ */

    private function printSummary(User $admin, array $sellers, array $buyers, array $lands): void
    {
        $this->command->info('LandMarket demo data created.');

        $this->command->table(
            ['Role', 'Email', 'Password'],
            array_merge(
                [['admin', $admin->email, self::PASSWORD]],
                array_map(fn ($s) => ['seller', $s['user']->email, self::PASSWORD], array_values($sellers)),
                array_map(fn ($b) => ['buyer', $b->email, self::PASSWORD], array_values($buyers)),
            )
        );

        $this->command->line(sprintf(
            '%d stores, %d lands, %d inquiries, %d saved, %d demands.',
            count($sellers), count($lands), Inquiry::where('seeded', true)->count(),
            SavedLand::where('seeded', true)->count(), Demand::where('seeded', true)->count()
        ));
    }
}
