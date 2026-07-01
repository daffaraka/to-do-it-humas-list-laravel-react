<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\JsonResponse;

class CamelCaseJsonResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Convert incoming request keys from camelCase to snake_case
        if ($request->isJson()) {
            $jsonData = $request->json()->all();
            $request->json()->replace($this->arrayToSnakeCase($jsonData));
        } else {
            $request->merge($this->arrayToSnakeCase($request->all()));
        }

        // 2. Process the request
        $response = $next($request);

        // 3. Convert outgoing response keys from snake_case to camelCase
        if ($response instanceof JsonResponse) {
            $data = $response->getData(true);
            $response->setData($this->arrayToCamelCase($data));
        }

        return $response;
    }

    /**
     * Convert array keys to snake_case.
     */
    private function arrayToSnakeCase(mixed $array): mixed
    {
        if (!is_array($array)) {
            return $array;
        }

        $result = [];
        foreach ($array as $key => $value) {
            $snakeKey = strtolower(preg_replace('/(?<!^)[A-Z]/', '_$0', $key));
            $result[$snakeKey] = $this->arrayToSnakeCase($value);
        }

        return $result;
    }

    /**
     * Convert array keys to camelCase.
     */
    private function arrayToCamelCase(mixed $array): mixed
    {
        if (!is_array($array)) {
            return $array;
        }

        $result = [];
        foreach ($array as $key => $value) {
            $camelKey = ltrim(lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', $key)))), '_');
            $result[$camelKey] = $this->arrayToCamelCase($value);
        }

        return $result;
    }
}
