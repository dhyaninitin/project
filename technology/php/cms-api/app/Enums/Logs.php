<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

// Enum class for Log Category
final class Logs extends Enum
{
    const Portal            = 'portal';
    const User              = 'user';
    const Request           = 'request';
    const Workflow          = 'workflow';
    const DEALSTAGE         = 'dealstage';
    const Task              = 'task';
    const Emailtemplate     = 'emailtemplate';
}
