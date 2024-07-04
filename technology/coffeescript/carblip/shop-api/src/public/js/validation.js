$(document).ready(function() {
    $('#contactForm').bootstrapValidator({
        
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            first_name: {
                validators: {
                    notEmpty: {
                        message: 'The full name is required and cannot be empty'
                    },
                    regexp: {
                    regexp: /^[a-zA-Z ]+$/,
                    message: 'Your first name cannot have numbers or symbols'
                }
                }
            },
            last_name: {
                validators: {
                    notEmpty: {
                        message: 'The last name is required and cannot be empty'
                    },
                    regexp: {
                    regexp: /^[a-zA-Z ]+$/,
                    message: 'Your last name cannot have numbers or symbols'
                }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: 'The email address is required and cannot be empty'
                    },
                    emailAddress: {
                        message: 'The email address is not valid'
                    },
                    regexp: {
                            regexp: '^[^@\\s]+@([^@\\s]+\\.)+[^@\\s]+$',
                            message: 'The value is not a valid email address'
                    }
                }
            },
            zipcode: {
                validators: {
                    notEmpty: {
                        message: 'The Zip Code is required and cannot be empty'
                    },
                    regexp: {
                        regexp: /^\d{5}$/,
                        message: 'The  zipcode must contain 5 digits'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                            message: 'The password is required'
                    },
                    stringLength: {
                            min: 6,
                            max: 30,
                            message: 'The password must be more than 6 and less than 30 characters long'
                    }
                }
            },
            cpassword: {
                validators: {
                    notEmpty: {
                            message: 'The Confirm password is required'
                    },
                    stringLength: {
                            min: 6,
                            max: 30,
                            message: 'The Confirm Password must be more than 6 and less than 30 characters long'
                    },
                    identical: {
                        field: 'password',
                        message: 'The password and  confirm Password are not the same.'
                    }
                }
            }
        }
    });


    $('#loginForm').bootstrapValidator({
        
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            email: {
                validators: {
                    notEmpty: {
                        message: 'The email address is required and cannot be empty'
                    },
                    emailAddress: {
                        message: 'The email address is not valid'
                    },
                    regexp: {
                            regexp: '^[^@\\s]+@([^@\\s]+\\.)+[^@\\s]+$',
                            message: 'The value is not a valid email address'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                            message: 'The password is required'
                    },
                    stringLength: {
                            min: 6,
                            max: 30,
                            message: 'The password must be more than 6 and less than 30 characters long'
                    }
                }
            }
        }
    });

    $('#forgotPassword').bootstrapValidator({
        
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            email: {
                validators: {
                    notEmpty: {
                        message: 'The email address is required and cannot be empty'
                    },
                    emailAddress: {
                        message: 'The email address is not valid'
                    },
                    regexp: {
                            regexp: '^[^@\\s]+@([^@\\s]+\\.)+[^@\\s]+$',
                            message: 'The value is not a valid email address'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                            message: 'The password is required'
                    },
                    stringLength: {
                            min: 6,
                            max: 30,
                            message: 'The password must be more than 6 and less than 30 characters long'
                    }
                }
            }
        }
    });

    $('#resetPassword').bootstrapValidator({
        
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            password: {
                validators: {
                    notEmpty: {
                            message: 'The password is required'
                    },
                    stringLength: {
                            min: 6,
                            max: 30,
                            message: 'The password must be more than 6 and less than 30 characters long'
                    }
                }
            },
            cpassword: {
                validators: {
                    notEmpty: {
                            message: 'The Confirm password is required'
                    },
                    stringLength: {
                            min: 6,
                            max: 30,
                            message: 'The Confirm Password must be more than 6 and less than 30 characters long'
                    },
                    identical: {
                        field: 'password',
                        message: 'The password and  confirm Password are not the same.'
                    }
                }
            }
        }
    });
});
