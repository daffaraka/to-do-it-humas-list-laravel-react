<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AvicennaWaySheet;
use App\Models\User;
use App\Support\DepartmentVisibility;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AvicennaWayController extends Controller
{
    public const CATEGORIES = ['Integritas', 'Profesional', 'Adaptif', 'Dedikatif', 'Sinergi'];

    private const RUBRICS = [
        'Integritas' => 'Makna: Sikap konsisten antara nilai-nilai, ucapan, dan tindakan yang dilandasi kejujuran, etika, tanggung jawab serta komitmen untuk melakukan dengan benar. Perilaku utama: bertindak jujur, bertanggung jawab, dan amanah. Fokus: dapat dipercaya dalam menyusun dan menyampaikan laporan secara benar, akurat, tepat waktu, serta teguh menjaga kerahasiaan data Yayasan dan Sekolah.',
        'Profesional' => 'Makna: Sikap dan perilaku yang menunjukkan kompetensi terbaik, etos kerja tinggi, tanggung jawab, etika kerja serta komitmen terhadap mutu dan standar kerja. Perilaku utama: etos kerja tinggi, terus belajar dan mengembangkan diri, mengambil keputusan berbasis data dan analisis, disiplin, bertanggung jawab, dan menunjukkan sikap kerja prima. Fokus: masuk tepat waktu, proaktif meningkatkan kompetensi, berbagi praktik baik, serta konsisten melakukan perencanaan, pelaksanaan, evaluasi, dan refleksi sesuai standar.',
        'Adaptif' => 'Makna: Kemauan dan kemampuan menyesuaikan diri melalui sikap terbuka, proses belajar, dan inovasi untuk merespons perubahan secara positif. Perilaku utama: terbuka terhadap perubahan, ide, dan cara baru; berpikir kritis, kreatif, dan inovatif. Fokus: beradaptasi dengan sistem, tata cara kerja, teknologi, dan kebijakan organisasi serta melakukan inovasi untuk memperbaiki tata cara kerja.',
        'Bersinergi' => 'Makna: Kemampuan berkolaborasi secara efektif dan harmonis dengan berbagai pihak untuk mencapai tujuan bersama. Perilaku utama: berkomunikasi terbuka, santun, fokus pada solusi, dan proaktif menjalin kolaborasi lintas. Fokus: aktif dalam kegiatan organisasi dan komunitas belajar serta berkomunikasi dan berkolaborasi antar unit, departemen, dan bidang kerja.',
        'Dedikatif' => 'Makna: Menjalankan tugas dengan penuh komitmen, totalitas, dan tangguh untuk memberikan kontribusi dan pengabdian terbaik demi kemajuan peserta didik serta lembaga. Perilaku utama: menjalankan tugas semaksimal mungkin, tangguh mencapai tujuan organisasi, dan peduli terhadap lingkungan kerja, sekolah, serta sekitarnya. Fokus: totalitas berkontribusi, mendahulukan komitmen waktu untuk organisasi, dan menunjukkan kepedulian terhadap lingkungan.',
    ];

    private function defaults(string $category): array
    {
        return [
            'category' => $category,
            'columns' => [
                'Nama',
                'Tanggal',
                'Perilaku yang sudah dilakukan (Kemarin)',
                '7 Habits',
                'Irisan Nilai Avicenna Way Lainnya',
                'Fasilitator',
                'Perilaku Favorit (Beri simbol bintang pada salah satu nama)',
                'AI Avicenna Way',
            ],
            'rows' => [['', '', '', '', '', '', '', '']],
        ];
    }

    private function normalizeDateKey(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '') {
            return null;
        }

        if (preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $trimmed, $matches)) {
            if (checkdate((int) $matches[2], (int) $matches[3], (int) $matches[1])) {
                return $trimmed;
            }
            return null;
        }

        try {
            return Carbon::parse($trimmed)->format('Y-m-d');
        } catch (\Throwable $exception) {
            return null;
        }
    }

    private function sortRowsByDateDescending(array $columns, array $rows): array
    {
        $dateIndex = array_search('Tanggal', $columns, true);
        if ($dateIndex === false) {
            $dateIndex = 1;
        }

        $indexed = [];
        foreach (array_values($rows) as $index => $row) {
            $normalizedRow = is_array($row) ? array_values($row) : [];
            $dateKey = $this->normalizeDateKey($normalizedRow[$dateIndex] ?? null);
            $indexed[] = [
                'index' => $index,
                'dateKey' => $dateKey,
                'row' => $normalizedRow,
            ];
        }

        usort($indexed, function (array $a, array $b): int {
            if ($a['dateKey'] === null && $b['dateKey'] === null) {
                return $a['index'] <=> $b['index'];
            }
            if ($a['dateKey'] === null) {
                return 1;
            }
            if ($b['dateKey'] === null) {
                return -1;
            }
            if ($a['dateKey'] !== $b['dateKey']) {
                return $b['dateKey'] <=> $a['dateKey'];
            }

            return $a['index'] <=> $b['index'];
        });

        return array_map(static fn (array $item): array => $item['row'], $indexed);
    }

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $allSheets = AvicennaWaySheet::query()->get()->groupBy('category');

        // Avicenna Way is a collaborative workbook. The rows are not owned by
        // the account that initially created the sheet, so every user must see
        // the complete, de-duplicated dataset.
        $sheets = collect(self::CATEGORIES)->map(function (string $category) use ($allSheets, $userId) {
            $defaults = $this->defaults($category);
            $sources = $allSheets->get($category, collect());
            $source = $sources->first();
            $columns = $source?->columns ?: $defaults['columns'];
            $uniqueRows = [];
            $seenRows = [];

            foreach ($sources as $sourceSheet) {
                foreach (is_array($sourceSheet->rows) ? $sourceSheet->rows : [] as $row) {
                    if (!is_array($row)) continue;
                    $normalizedRow = array_values($row);
                    if (!collect($normalizedRow)->contains(fn ($cell) => trim((string) $cell) !== '')) continue;
                    $rowKey = json_encode($normalizedRow);
                    if (isset($seenRows[$rowKey])) continue;
                    $seenRows[$rowKey] = true;
                    $uniqueRows[] = $normalizedRow;
                }
            }

            $rows = $this->sortRowsByDateDescending($columns, $uniqueRows ?: $defaults['rows']);
            if ($source) {
                $source->setAttribute('columns', $columns);
                $source->setAttribute('rows', $rows);
                return $source;
            }

            return AvicennaWaySheet::create([
                'id' => (string) Str::uuid(),
                'user_id' => $userId,
                ...$defaults,
            ]);
        });

        return response()->json($sheets->values());
    }

    public function update(Request $request, string $category)
    {
        abort_unless(in_array($category, self::CATEGORIES, true), 404);

        $validated = $request->validate([
            'columns' => ['sometimes', 'array', 'min:1'],
            'columns.*' => ['string', 'max:255'],
            'rows' => ['sometimes', 'array'],
            'rows.*' => ['array'],
        ]);

        $defaults = $this->defaults($category);
        $columns = $validated['columns'] ?? $defaults['columns'];
        $rows = $this->sortRowsByDateDescending($columns, $validated['rows'] ?? $defaults['rows']);

        // Keep the workbook collaborative. All accounts read the combined
        // category data, so synchronize the saved snapshot to every existing
        // category sheet; otherwise a deleted row could reappear from another
        // user's older copy on the next refresh.
        $sheets = AvicennaWaySheet::where('category', $category)->get();
        if ($sheets->isEmpty()) {
            $sheet = AvicennaWaySheet::create([
                'id' => (string) Str::uuid(),
                'user_id' => $request->user()->id,
                'category' => $category,
                'columns' => $columns,
                'rows' => $rows,
            ]);
        } else {
            $sheets->each(function (AvicennaWaySheet $categorySheet) use ($columns, $rows): void {
                $categorySheet->update([
                    'columns' => $columns,
                    'rows' => $rows,
                ]);
            });
            $sheet = $sheets->first()->fresh();
        }

        return response()->json($sheet);
    }

    public function report(Request $request)
    {
        $visibleUsers = DepartmentVisibility::apply(
            User::query()->with(['role:id,name', 'department:id,name']),
            $request->user(),
        )->orderBy('name')->get();

        $userByName = $visibleUsers->keyBy(fn (User $user) => $this->normalizePersonName($user->name));
        $sheets = AvicennaWaySheet::query()
            ->whereIn('user_id', $visibleUsers->pluck('id'))
            ->get();

        $categoryTotals = collect(self::CATEGORIES)->mapWithKeys(fn (string $category) => [
            $category => [
                'entries' => 0,
                'people' => 0,
                'favorite_points' => 0,
                'analyzed' => 0,
                'dates' => [],
            ],
        ])->all();
        $people = [];

        foreach ($sheets as $sheet) {
            $columns = is_array($sheet->columns) ? $sheet->columns : [];
            $rows = is_array($sheet->rows) ? $sheet->rows : [];
            $nameIndex = array_search('Nama', $columns, true);
            $dateIndex = array_search('Tanggal', $columns, true);
            $favoriteIndex = array_search('Perilaku Favorit (Beri simbol bintang pada salah satu nama)', $columns, true);
            $aiIndex = array_search('AI Avicenna Way', $columns, true);
            $nameIndex = $nameIndex === false ? 0 : $nameIndex;
            $dateIndex = $dateIndex === false ? 1 : $dateIndex;

            foreach ($rows as $row) {
                if (!is_array($row)) continue;
                $personName = trim((string) ($row[$nameIndex] ?? ''));
                if ($personName === '') continue;

                $person = $userByName->get($this->normalizePersonName($personName));
                $personId = $person?->id ?: 'external:' . $this->normalizePersonName($personName);
                if (!isset($people[$personId])) {
                    $people[$personId] = [
                        'id' => $personId,
                        'name' => $person?->name ?: $personName,
                        'role' => ['id' => $person?->role?->id, 'name' => $person?->role?->name ?: 'Belum dipetakan'],
                        'department' => ['id' => $person?->department?->id, 'name' => $person?->department?->name],
                        'categories' => collect(self::CATEGORIES)->mapWithKeys(fn (string $category) => [
                            $category => ['entries' => 0, 'favorite_points' => 0, 'analyzed' => 0, 'latest_date' => null, 'dates' => [], 'missing_dates' => []],
                        ])->all(),
                    ];
                }

                $category = in_array($sheet->category, self::CATEGORIES, true) ? $sheet->category : null;
                if (!$category) continue;
                $entry = &$people[$personId]['categories'][$category];
                $entry['entries']++;
                $isFavorite = $favoriteIndex !== false && (string) ($row[$favoriteIndex] ?? '') === '1';
                $hasAnalysis = $aiIndex !== false && trim((string) ($row[$aiIndex] ?? '')) !== '';
                if ($isFavorite) $entry['favorite_points']++;
                if ($hasAnalysis) $entry['analyzed']++;
                $date = trim((string) ($row[$dateIndex] ?? ''));
                $normalizedDate = $this->normalizeDateKey($date);
                if ($normalizedDate !== null && (!$entry['latest_date'] || $normalizedDate > $entry['latest_date'])) $entry['latest_date'] = $normalizedDate;
                if ($normalizedDate !== null && !in_array($normalizedDate, $entry['dates'], true)) $entry['dates'][] = $normalizedDate;
                unset($entry);
            }
        }

        // Include team members from the role directory even when they have no entries yet.
        foreach ($visibleUsers as $person) {
            if (isset($people[$person->id])) continue;
            $people[$person->id] = [
                'id' => $person->id,
                'name' => $person->name,
                'role' => ['id' => $person->role?->id, 'name' => $person->role?->name ?: 'Belum dipetakan'],
                'department' => ['id' => $person->department?->id, 'name' => $person->department?->name],
                'categories' => collect(self::CATEGORIES)->mapWithKeys(fn (string $category) => [
                    $category => ['entries' => 0, 'favorite_points' => 0, 'analyzed' => 0, 'latest_date' => null, 'dates' => [], 'missing_dates' => []],
                ])->all(),
            ];
        }

        foreach ($people as $person) {
            foreach (self::CATEGORIES as $category) {
                $entry = $person['categories'][$category];
                $categoryTotals[$category]['entries'] += $entry['entries'];
                $categoryTotals[$category]['favorite_points'] += $entry['favorite_points'];
                $categoryTotals[$category]['analyzed'] += $entry['analyzed'];
                $categoryTotals[$category]['dates'] = array_values(array_unique(array_merge($categoryTotals[$category]['dates'], $entry['dates'])));
                if ($entry['entries'] > 0) $categoryTotals[$category]['people']++;
            }
        }

        $holidays = array_fill_keys([
            '2026-01-01', '2026-01-16', '2026-02-16', '2026-02-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23', '2026-03-24', '2026-04-03', '2026-04-05', '2026-05-01', '2026-05-14', '2026-05-15', '2026-05-27', '2026-05-28', '2026-05-31', '2026-06-01', '2026-06-16', '2026-08-17', '2026-08-25', '2026-12-24', '2026-12-25',
        ], true);
        foreach ($people as &$person) {
            foreach (self::CATEGORIES as $category) {
                $rangeDates = $categoryTotals[$category]['dates'];
                if (!$rangeDates) continue;
                sort($rangeDates);
                try {
                    $start = Carbon::createFromFormat('Y-m-d', $rangeDates[0]);
                    $end = Carbon::createFromFormat('Y-m-d', $rangeDates[count($rangeDates) - 1]);
                } catch (\Throwable $exception) {
                    continue;
                }
                if ($start->gt($end) || $start->diffInDays($end) > 3660) continue;
                $loggedDates = array_fill_keys($person['categories'][$category]['dates'], true);
                $missingDates = [];
                for ($cursor = $start->copy(); $cursor->lte($end); $cursor->addDay()) {
                    $iso = $cursor->format('Y-m-d');
                    if ($cursor->isWeekday() && !isset($holidays[$iso]) && !isset($loggedDates[$iso])) $missingDates[] = $iso;
                }
                $person['categories'][$category]['missing_dates'] = $missingDates;
            }
        }
        unset($person);

        $roleGroups = collect($people)->groupBy(fn (array $person) => $person['role']['id'] ?: 'unassigned')
            ->map(function ($members, $roleId) {
                $first = $members->first();
                $categories = collect(self::CATEGORIES)->mapWithKeys(function (string $category) use ($members) {
                    return [$category => [
                        'entries' => $members->sum(fn (array $member) => $member['categories'][$category]['entries']),
                        'people' => $members->filter(fn (array $member) => $member['categories'][$category]['entries'] > 0)->count(),
                        'favorite_points' => $members->sum(fn (array $member) => $member['categories'][$category]['favorite_points']),
                        'analyzed' => $members->sum(fn (array $member) => $member['categories'][$category]['analyzed']),
                    ]];
                })->all();

                return [
                    'id' => $roleId,
                    'name' => $first['role']['name'] ?: 'Belum dipetakan',
                    'members' => $members->values()->all(),
                    'categories' => $categories,
                ];
            })->sortBy('name')->values()->all();

        return response()->json([
            'categories' => self::CATEGORIES,
            'category_totals' => $categoryTotals,
            'roles' => $roleGroups,
        ]);
    }

    private function normalizePersonName(?string $name): string
    {
        return Str::of((string) $name)->lower()->squish()->toString();
    }

    public function analyze(Request $request, string $category)
    {
        abort_unless(in_array($category, self::CATEGORIES, true), 404);

        $validated = $request->validate([
            'row' => ['required', 'array'],
            'active_category' => ['nullable', 'string'],
        ]);

        $apiKey = config('services.gemini.key');
        if (!$apiKey) {
            return response()->json(['message' => 'GEMINI_API_KEY belum dikonfigurasi di backend.'], 503);
        }

        $rowText = collect($validated['row'])
            ->except([7])
            ->filter(fn ($value) => is_string($value) && trim($value) !== '')
            ->values()
            ->implode(' | ');

        if (trim($rowText) === '') {
            return response()->json(['message' => 'Isi perilaku terlebih dahulu sebelum dianalisis.'], 422);
        }

        $rubricText = collect(self::RUBRICS)
            ->map(fn ($rubric, $name) => "{$name}: {$rubric}")
            ->implode("\n");

        $prompt = "Analisis perilaku pegawai berdasarkan rumusan Nilai Avicenna Way berikut. Sheet aktif: {$category}.\n\n{$rubricText}\n\nData satu baris: {$rowText}\n\nBerikan JSON valid saja dengan struktur: {\"primary_category\": string, \"scores\": {\"Integritas\": number, \"Profesional\": number, \"Adaptif\": number, \"Bersinergi\": number, \"Dedikatif\": number}, \"status\": \"Sesuai\"|\"Perlu ditinjau\", \"explanation\": string, \"suggestion\": string}. Persentase 0-100 harus mencerminkan kecocokan perilaku terhadap masing-masing rumusan. Jika kategori utama berbeda dari sheet aktif, jelaskan perbedaannya.";

        try {
            $response = Http::acceptJson()
                ->connectTimeout(10)
                ->timeout(45)
                ->retry([500, 1000, 2000, 4000], 0, fn ($exception) => $exception instanceof ConnectionException, false)
                ->post('https://generativelanguage.googleapis.com/v1beta/models/' . config('services.gemini.model') . ':generateContent?key=' . urlencode($apiKey), [
                    'systemInstruction' => [
                        'parts' => [[
                            'text' => 'Anda adalah evaluator nilai Avicenna Way. Gunakan hanya rumusan yang diberikan dan jangan mengarang fakta. Jawab JSON valid saja tanpa markdown.',
                        ]],
                    ],
                    'contents' => [[
                        'role' => 'user',
                        'parts' => [['text' => $prompt]],
                    ]],
                    'generationConfig' => [
                        'temperature' => 0.2,
                        'responseMimeType' => 'application/json',
                    ],
                ]);

            if ($response->failed()) {
                $status = $response->status();
                $providerMessage = data_get($response->json(), 'error.message');
                if ($status === 429) {
                    return response()->json(['message' => 'Kredit API Gemini habis atau batas pemakaian tercapai. Periksa kuota dan konfigurasi Gemini lalu coba lagi.'], 429);
                }
                return response()->json(['message' => $providerMessage ?: 'Layanan AI tidak dapat memproses analisis saat ini.'], 502);
            }

            $content = data_get($response->json(), 'candidates.0.content.parts.0.text');
            $analysis = json_decode($content, true);
            if (!is_array($analysis)) {
                return response()->json(['message' => 'Format jawaban AI tidak valid.'], 502);
            }

            return response()->json($analysis);
        } catch (ConnectionException $exception) {
            report($exception);
            return response()->json(['message' => 'Server tidak dapat terhubung ke layanan AI Gemini. Periksa koneksi internet, firewall, atau proxy server.'], 503);
        } catch (\Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Analisis AI gagal diproses.'], 502);
        }
    }
}
