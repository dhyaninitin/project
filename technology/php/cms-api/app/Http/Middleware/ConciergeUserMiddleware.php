<?php

namespace App\Http\Middleware;

use Closure;

class ConciergeUserMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if ( $this->checkToken( $request ) ) {
            return $next( $request );
        }
        return response()->json( [ 'error' => 'Unauthorized' ], 403 );
    }

    public function checkToken($request)
    {

        $token  = $request->header( 'api-key' );

        if ($token == config('auth.webhookToken'))
        {
            return true;
        }
        return false;
    }
}
