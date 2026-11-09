<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AvicennaWaySheet;
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

    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $existing = AvicennaWaySheet::where('user_id', $userId)->get()->keyBy('category');

        $sheets = collect(self::CATEGORIES)->map(function (string $category) use ($existing, $userId) {
            $sheet = $existing->get($category);
            if ($sheet) return $sheet;

            $defaults = $this->defaults($category);
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
        $sheet = AvicennaWaySheet::updateOrCreate(
            ['user_id' => $request->user()->id, 'category' => $category],
            [
                'columns' => $validated['columns'] ?? $defaults['columns'],
                'rows' => $validated['rows'] ?? $defaults['rows'],
            ]
        );

        return response()->json($sheet);
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
                    return response()->json(['message' => 'Kredit API OpenAI habis atau batas pemakaian tercapai. Tambahkan saldo/billing OpenAI lalu coba lagi.'], 429);
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
            return response()->json(['message' => 'Server tidak dapat terhubung ke layanan AI OpenAI. Periksa koneksi internet, firewall, atau proxy server.'], 503);
        } catch (\Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Analisis AI gagal diproses.'], 502);
        }
    }
}
