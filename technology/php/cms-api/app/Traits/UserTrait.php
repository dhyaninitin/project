<?php

namespace App\Traits;


trait UserTrait
{
    /**
     * @return String
     */
    protected function getUserTimeZoneDiff()
    {
        return date('P');
    }
}
