<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

final class Roles extends Enum
{
    const SuperAdmin        = 'superadmin';
    const Admin             = 'admin';
    const Administrative    = 'administrative';
    const Manager           = 'manager';
    const Salesperson       = 'salesperson';
    const Concierge         = 'concierge';
}
