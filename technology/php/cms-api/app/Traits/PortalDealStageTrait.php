<?php

namespace App\Traits;


trait PortalDealStageTrait
{
    /**
     * @return String
     */
    protected function checkPipelineValue($value)
    {
        switch ($value) {
            case '1':
                $value = 'Sales';
                break;
            case '2':
                $value = 'Concierge';
                break;
            default:
                $value = '';
                break;
        }
        return $value;
    }
}
