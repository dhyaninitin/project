<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

// Enum for Portal actions
final class PortalAction extends Enum
{
    const CREATED               = 'created';
    const UPDATED               = 'updated';
    const ROLE_UPDATED          = 'role_updated';
    const DELETED               = 'deleted';
}
