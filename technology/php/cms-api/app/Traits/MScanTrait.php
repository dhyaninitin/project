<?php

namespace App\Traits;
use Carbon\Carbon;

trait MScanTrait
{
    /**
     * @return String
     */
    protected function converTStoTimestamp($str)
    {
        $time = (int)((int)substr($str, 7, 13) / 1000);
        return Carbon::createFromTimestamp($time);
    }
}
