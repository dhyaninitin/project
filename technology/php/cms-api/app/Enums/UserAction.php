<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

// Enum for User actions
final class UserAction extends Enum
{
    const CREATED               = 'created';
    const UPDATED               = 'updated';
    const ROLE_UPDATED          = 'role_updated';
    const TOGGLED               = 'toggled';
    const DELETED               = 'deleted';
}
