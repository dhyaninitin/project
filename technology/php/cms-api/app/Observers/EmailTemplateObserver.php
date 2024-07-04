<?php

namespace App\Observers;
use App\Model\{EmailTemplates, Log};
use App\Enums\{Roles, Logs, PortalAction, TargetTypes, SourceUtm};
use Auth;

class EmailTemplateObserver
{
    /**
     * Handle the email templates "created" event.
     *
     * @param  \App\EmailTemplates  $emailTemplates
     * @return void
     */
    public function created(EmailTemplates $emailTemplates)
    {
        $portalUser = Auth::user();

        $msg = "<b>{$emailTemplates->title}</b> was <b>created</b> on ".SourceUtm::Portal." by <b>{$portalUser->full_name}</b>";

        Log::create(array(
            'category'          => Logs::Emailtemplate,
            'action'            => PortalAction::CREATED,
            'target_id'         => $emailTemplates->id,
            'target_type'       => TargetTypes::Emailtemplate,
            'portal_user_id'    => $portalUser->id,
            'portal_user_name'  => $portalUser->full_name,
            'content'           => $msg,
        ));
    }

    /**
     * Handle the email templates "updated" event.
     *
     * @param  \App\EmailTemplates  $emailTemplates
     * @return void
     */
    public function updated(EmailTemplates $emailTemplates)
    {
        $portalUser = Auth::user();
        $oldData = collect($emailTemplates->getOriginal());
        $newData = collect($emailTemplates->getAttributes());
        $diff = $newData->diff($oldData);
        $msg = $oldData['title'];
        if(isset($diff->toArray()['title'])){
            $msg = "";
            $msg .= " <b>title</b> was <b>updated</b> from {$oldData['title']} to <b>{$newData['title']}</b>,";
        }

        if(isset($diff->toArray()['subject'])){
            $msg .= " <b>subject</b> was <b>updated</b> from {$oldData['subject']} to <b>{$newData['subject']}</b>,";
        }

        if(isset($diff->toArray()['body'])){
            $msg .= " <b>body</b> was <b>updated</b>,";
        }

        if(isset($diff->toArray()['is_active'])){
            $oldValue = ($oldData['is_active'] == 0) ? 'active' : 'in-active';
            $newValue = ($newData['is_active'] == 0) ? 'active' : 'in-active';
            $msg .= " <b>status</b> was <b>updated</b> from {$oldValue} to <b>{$newValue}</b>,";
        }

        $msg = substr(trim($msg), 0, -1);
        $msg .= " by <b>{$portalUser->full_name}</b>";

        Log::create(array(
            'category'         => Logs::Emailtemplate,
            'action'           => PortalAction::UPDATED,
            'target_id'        => $emailTemplates->id,
            'target_type'      => TargetTypes::Emailtemplate,
            'portal_user_id'   => $portalUser->id,
            'portal_user_name' => $portalUser->full_name,
            'content'          => $msg,
        ));
    }

    /**
     * Handle the email templates "deleted" event.
     *
     * @param  \App\EmailTemplates  $emailTemplates
     * @return void
     */
    public function deleted(EmailTemplates $emailTemplates)
    {
        $portalUser = Auth::user();
        $msg= '<b>'.$emailTemplates->title.'</b> <b>deleted </b> by <b>'.$portalUser->full_name.'</b>';
        Log::create(array(
            'category'          => Logs::Emailtemplate,
            'action'            => PortalAction::DELETED,
            'target_id'         => $emailTemplates->id,
            'target_type'       => TargetTypes::Emailtemplate,
            'portal_user_id'    => $portalUser->id,
            'portal_user_name'  => $portalUser->full_name,
            'content'           => $msg,
        ));
    }

    /**
     * Handle the email templates "restored" event.
     *
     * @param  \App\EmailTemplates  $emailTemplates
     * @return void
     */
    public function restored(EmailTemplates $emailTemplates)
    {
        //
    }

    /**
     * Handle the email templates "force deleted" event.
     *
     * @param  \App\EmailTemplates  $emailTemplates
     * @return void
     */
    public function forceDeleted(EmailTemplates $emailTemplates)
    {
        //
    }
}
