<?php

namespace App\Enums;

use BenSampo\Enum\Enum;


final class Permissions extends Enum
{
    const Create                            = 'create';
    const Update                            = 'update';
    const View                              = 'view';
    const Delete                            = 'delete';
    const CreateLocal                       = 'create_local';
    const UpdateLocal                       = 'update_local';
    const ViewLocal                         = 'view_local';
    const DeleteLocal                       = 'delete_local';
    const ManagePortalUser                     = 'manage_portal';
    const ManagePortalUserLocal                = 'manage_portal_local';
    const ManagePortalSalespersonUser          = 'manage_portal_sales';
    const ManagePortalSalespersonUserLocal     = 'manage_portal_sales_local';
}
