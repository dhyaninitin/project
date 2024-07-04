export const enum LSkeys {
  BEARER_TOKEN = "bearerToken",
  USER_EMAIL = "userEmail",
  USER_NAME = "userName",
  DEVICE_GUID = "deviceGuid",
  LANGUAGE = 'language',
  DEFAULT_ACCOUNT = 'defaultAccount',
  REGISTERED_EMAIL = 'registeredEmail',
  INVITE_TOKEN = 'inviteToken'
}

export const ValidationConstants = {
  passwordStrategy: {
    PASSWORD_MIN_LENGTH: 6,
    PASSWORD_MAX_LENGTH: 15,
    PASSWORD_PATTERN: ""
  },
  userAccountStrategy: {
    NAME_MIN_LENGTH: 3,
    NAME_MAX_LENGTH: 20,
    PHONE_MIN_LENGTH: 8,
    PHONE_PATTERN: "^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"
  },
  userEmailStrategy: {
    EMAIL_PATTERN: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
  },
  newRoleNameStrategy: {
    ROLE_MIN_LENGTH: 5,
    ROLE_MAX_LENGTH: 15,
  }
}
export const userRoles = [
  { id: 1, name: 'Corporate' },
  { id: 2, name: 'Staffing' },
];
