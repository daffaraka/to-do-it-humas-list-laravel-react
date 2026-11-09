<?php

namespace Tests\Unit;

use App\Http\Controllers\API\AvicennaWayController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AvicennaWayControllerTest extends TestCase
{
    public function test_it_retries_temporary_openai_connection_failures(): void
    {
        config(['services.openai.key' => 'test-key']);
        Http::fake([
            'api.openai.com/*' => Http::sequence()
                ->pushFailedConnection()
                ->pushFailedConnection()
                ->push([
                    'choices' => [
                        ['message' => ['content' => '{"result":"ok"}']],
                    ],
                ]),
        ]);

        $response = app(AvicennaWayController::class)->analyze(
            Request::create('/api/avicenna-way/Integritas/analyze', 'POST', [
                'row' => ['Nama pegawai', 'Melaporkan data secara akurat'],
            ]),
            'Integritas',
        );

        $this->assertSame(200, $response->getStatusCode());
        $this->assertSame(['result' => 'ok'], $response->getData(true));
        Http::assertSentCount(3);
    }

    public function test_it_does_not_retry_openai_rate_limit_responses(): void
    {
        config(['services.openai.key' => 'test-key']);
        Http::fake([
            'api.openai.com/*' => Http::response([
                'error' => ['message' => 'rate limit'],
            ], 429),
        ]);

        $response = app(AvicennaWayController::class)->analyze(
            Request::create('/api/avicenna-way/Integritas/analyze', 'POST', [
                'row' => ['Nama pegawai', 'Melaporkan data secara akurat'],
            ]),
            'Integritas',
        );

        $this->assertSame(429, $response->getStatusCode());
        Http::assertSentCount(1);
    }
}
