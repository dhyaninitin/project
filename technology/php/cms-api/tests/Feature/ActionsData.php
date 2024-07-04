<?php

return [
    'marketing-email' => [0 => ['actionName' => 'Send Marketing/Transactional Email', 'action' => ['id' => 3, 'value' => 'Send Marketing/Transactional Email',], 'email' => ['id' => 5292831, 'value' => 'Welcome Email', 'senderName' => NULL, 'senderEmail' => NULL,], 'parentContainer' => NULL, 'event_master_id' => 104, 'seq_id' => 1, 'id' => '9a20a18f-038c-4a70-9269-e6418a5eb60c',],],
    'sms-twice-update-demail' => [0 => ['actionName' => 'Send SMS', 'action' => ['id' => 4, 'value' => 'Send SMS',], 'smspayload' => ['id' => 14, 'value' => 'Thanks for applying to join the CarBlip Concierge team!',], 'parentContainer' => NULL, 'event_master_id' => 105, 'send_sms_from' => 1001, 'seq_id' => 1, 'id' => '9c20a18f-038c-4a70-9269-e6418a5eb60c',], 1 => ['actionName' => 'Send SMS', 'action' => ['id' => 4, 'value' => 'Send SMS',], 'smspayload' => ['id' => 14, 'value' => 'Thanks for applying to join the CarBlip Concierge team!',], 'parentContainer' => NULL, 'event_master_id' => 105, 'send_sms_from' => 1001, 'seq_id' => 2, 'id' => '9a20a18f-038c-4a70-9269-e6418a5eb69n',], 2 => ['actionName' => 'Update Property', 'action' => ['id' => 6, 'value' => 'Update Property',], 'property' => [0 => ['id' => 2, 'value' => '(Contacts) First name', 'conditionvalue' => 'T', 'condition_value' => 'T', 'fieldname' => 'first_name', 'tableid' => 1,],], 'parentContainer' => NULL, 'event_master_id' => 106, 'seq_id' => 3, 'id' => '9a20a18f-038c-4660-9269-e6418a5eb60c',], 3 => ['actionName' => 'Send Direct Email', 'action' => ['id' => 7, 'value' => 'Send Direct Email',], 'email' => ['id' => 4, 'value' => 'Zimbra Testing', 'subject' => 'Testing Email', 'body' => '<p>Hello {first_name} {last_name} this is test message form dev.</p><p><br></p><p>Thank you</p>',], 'parentContainer' => NULL, 'event_master_id' => 107, 'seq_id' => 4, 'id' => '1z20a18f-038c-4a70-9269-e6418a5eb60c',],],
    'delay-memail-delay-sms-delay-email' => [0 => ['actionName' => 'Send Marketing/Transactional Email', 'action' => ['id' => 3, 'value' => 'Send Marketing/Transactional Email',], 'email' => ['id' => 5292831, 'value' => 'Welcome Email', 'senderName' => NULL, 'senderEmail' => NULL,], 'parentContainer' => NULL, 'event_master_id' => 104, 'seq_id' => 1, 'id' => '9a20a18f-008c-4a70-9269-e6418a5eb60c',], 1 => ['actionName' => 'Delay', 'action' => ['id' => 1, 'value' => 'Delay',], 'delay' => ['id' => 1, 'value' => 'Delay for a set amount of time',], 'days' => 0, 'hours' => 0, 'minutes' => 2, 'seconds' => 0, 'date' => NULL, 'timeofday' => NULL, 'parentContainer' => NULL, 'event_master_id' => 102, 'seq_id' => 2, 'id' => '9a29x28f-038c-4a70-9269-e6418a5eb60c',], 2 => ['actionName' => 'Send SMS', 'action' => ['id' => 4, 'value' => 'Send SMS',], 'smspayload' => ['id' => 14, 'value' => 'Referral SMS 1',], 'parentContainer' => NULL, 'event_master_id' => 105, 'send_sms_from' => 1001, 'seq_id' => 3, 'id' => 'xxx0a18f-038c-4a70-9269-e6418a5eb60c',], 3 => ['actionName' => 'Delay', 'action' => ['id' => 1, 'value' => 'Delay',], 'delay' => ['id' => 1, 'value' => 'Delay for a set amount of time',], 'days' => 0, 'hours' => 0, 'minutes' => 2, 'seconds' => 0, 'date' => NULL, 'timeofday' => NULL, 'parentContainer' => NULL, 'event_master_id' => 102, 'seq_id' => 4, 'id' => '9a20a18f-038c-4a70-9269-e64xxa5eb60c',], 4 => ['actionName' => 'Send Direct Email', 'action' => ['id' => 7, 'value' => 'Send Direct Email',], 'email' => ['id' => 4, 'value' => 'Zimbra Testing', 'subject' => 'Testing Email', 'body' => '<p>Hello {first_name} {last_name} this is test message form dev.</p><p><br></p><p>Thank you</p>',], 'parentContainer' => NULL, 'event_master_id' => 107, 'seq_id' => 5, 'id' => '9a20a18f-448c-4a70-9269-e6418a5eb60c',],],


    'branch-delay-memail-sms-demail-update' => [
        0 => [
            'actionName' => 'Send Marketing/Transactional Email',
            'action' => [
                'id' => 3,
                'value' => 'Send Marketing/Transactional Email',
            ],
            'email' => [
                'id' => 5292831,
                'value' => 'Welcome Email',
                'senderName' => NULL,
                'senderEmail' => NULL,
            ],
            'parentContainer' => NULL,
            'event_master_id' => 104,
            'seq_id' => 1,
            'id' => '3574b484-fd34-4645-903f-65b2c34535a0',
        ],
        1 => [
            'actionName' => 'Delay',
            'action' => [
                'id' => 1,
                'value' => 'Delay',
            ],
            'delay' => [
                'id' => 1,
                'value' => 'Delay for a set amount of time',
            ],
            'days' => 0,
            'hours' => 0,
            'minutes' => 2,
            'seconds' => 0,
            'date' => NULL,
            'timeofday' => NULL,
            'parentContainer' => NULL,
            'event_master_id' => 102,
            'seq_id' => 2,
            'id' => '8574b483-fd34-4645-903f-65b2c34535a0',
        ],
        2 => [
            'actionName' => 'Send SMS',
            'action' => [
                'id' => 4,
                'value' => 'Send SMS',
            ],
            'smspayload' => [
                'id' => 14,
                'value' => 'Thanks for applying to join the CarBlip Concierge team!',
            ],
            'parentContainer' => NULL,
            'event_master_id' => 105,
            'send_sms_from' => 1001,
            'seq_id' => 3,
            'id' => '8574b484-f334-4645-903f-65b2c34535a0',
        ],
        3 => [
            'actionName' => 'Branch',
            'groupValues' => [
                0 => [
                    0 => [
                        'type' => [
                            'id' => 1,
                            'value' => 'Contacts',
                        ],
                        'property' => [
                            'id' => 2,
                            'title' => 'Contacts First name',
                            'value' => 'first_name',
                        ],
                        'condition' => [
                            'id' => 1,
                            'value' => 'Equals',
                        ],
                        'conditionvalue' => 'Branch Test',
                        'condition_value' => 'Branch Test',
                    ],
                ],
            ],
            'action' => [
                'id' => 2,
                'value' => 'Branch',
            ],
            'ifbranchname' => 'Test Branch',
            'ifbranchdata' => [
                0 => [
                    'actionName' => 'Delay',
                    'action' => [
                        'id' => 1,
                        'value' => 'Delay',
                    ],
                    'delay' => [
                        'id' => 1,
                        'value' => 'Delay for a set amount of time',
                    ],
                    'days' => 0,
                    'hours' => 0,
                    'minutes' => 2,
                    'seconds' => 0,
                    'date' => NULL,
                    'timeofday' => NULL,
                    'parentContainer' => NULL,
                    'event_master_id' => 102,
                    'seq_id' => 5,
                    'id' => '85743484-fd34-4645-903f-65b2c34535a0',
                ],
                1 => [
                    'actionName' => 'Send Direct Email',
                    'action' => [
                        'id' => 7,
                        'value' => 'Send Direct Email',
                    ],
                    'email' => [
                        'id' => 4,
                        'value' => 'Zimbra Testing',
                        'subject' => 'Testing Email',
                        'body' => '<p>Hello {first_name} {last_name} this is test message form dev.</p><p><br></p><p>Thank you</p>',
                    ],
                    'parentContainer' => NULL,
                    'event_master_id' => 107,
                    'seq_id' => 6,
                    'id' => '8574b484-fd34-4645-903f-65b2c34535a0',
                ],
                2 => [
                    'actionName' => 'Update Property',
                    'action' => [
                        'id' => 6,
                        'value' => 'Update Property',
                    ],
                    'property' => [
                        0 => [
                            'id' => 5,
                            'value' => '(Contacts) Gender',
                            'conditionvalue' => 'xyx',
                            'condition_value' => 'xyx',
                            'fieldname' => 'gender',
                            'tableid' => 1,
                        ],
                    ],
                    'parentContainer' => NULL,
                    'event_master_id' => 106,
                    'seq_id' => 7,
                    'id' => '8574b484-fd34-4645-903f-65b2c34545a0',
                ],
            ],
            'thenbranchname' => NULL,
            'thenbranchdata' => [
                0 => [
                    'actionName' => 'Delay',
                    'action' => [
                        'id' => 1,
                        'value' => 'Delay',
                    ],
                    'delay' => [
                        'id' => 1,
                        'value' => 'Delay for a set amount of time',
                    ],
                    'days' => 0,
                    'hours' => 0,
                    'minutes' => 2,
                    'seconds' => 0,
                    'date' => NULL,
                    'timeofday' => NULL,
                    'parentContainer' => NULL,
                    'event_master_id' => 102,
                    'seq_id' => 8,
                    'id' => '8574b484-fd34-4645-903f-65b2c34537a0',
                ],
                1 => [
                    'actionName' => 'Send Marketing/Transactional Email',
                    'action' => [
                        'id' => 3,
                        'value' => 'Send Marketing/Transactional Email',
                    ],
                    'email' => [
                        'id' => 5292831,
                        'value' => 'Welcome Email',
                        'senderName' => NULL,
                        'senderEmail' => NULL,
                    ],
                    'parentContainer' => NULL,
                    'event_master_id' => 104,
                    'seq_id' => 9,
                    'id' => '8574b484-fd34-4645-903f-65b2c34535v0',
                ],
                2 => [
                    'actionName' => 'Send SMS',
                    'action' => [
                        'id' => 4,
                        'value' => 'Send SMS',
                    ],
                    'smspayload' => [
                        'id' => 14,
                        'value' => 'Thanks for applying to join the CarBlip Concierge team!',
                    ],
                    'parentContainer' => NULL,
                    'event_master_id' => 105,
                    'send_sms_from' => 1001,
                    'seq_id' => 10,
                    'id' => '8574b484-fd34-4645-903f-65b2v34535a0',
                ],
            ],
            'parentContainer' => NULL,
            'event_master_id' => 103,
            'seq_id' => 4,
            'showCondition' => true,
            'id' => '8574b484-fd34-4645-903x-65b2c34535a0',
        ],
    ]
];
