<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class BuyingMethod extends Enum
{
    const Cash      = 'Cash';
    const Finance   = 'Finance';
    const Lease     = 'Lease';
}
