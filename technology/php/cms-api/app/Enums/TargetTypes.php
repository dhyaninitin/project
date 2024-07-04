<?php

namespace App\Enums;

use BenSampo\Enum\Enum;

// Enum for TargetTyps
final class TargetTypes extends Enum
 {
    const Portal            = 'App\Model\PortalUser';
    const User              = 'App\Model\User';
    const Request           = 'App\Model\VehicleRequest';
    const Quote             = 'App\Model\Quote';
    const PurchaseOrder     = 'App\Model\PurchaseOrder';
    const WholeSaleQuote    =  'App\Model\WholeSaleQuote';
    const Workflow          =  'App\Model\HubspotWorkFlows';
    const DealStage         =  'App\Model\DealStage';
    const Task              =  'App\Model\Task';
    const Emailtemplate     =  'App\Model\EmailTemplates';
    const WorkflowSetting     =  'App\Model\WorkflowSetting';
}
