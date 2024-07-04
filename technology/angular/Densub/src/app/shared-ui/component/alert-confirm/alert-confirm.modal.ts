export class AlertConfirm {
  // type: AlertType;
  title: string;
  message?: Message;
  cancelButton: CancelButton;
  confirmButton: ConfirmButton;

  inputText?: Input;
  currentSelection?: any;
  matchArray?: any[];
  errorMsg?: string;
  selectInput?: Select;
  checkboxInput?: Checkbox;
}

class Input {
  show: boolean;
  label: string;
  // isValidate: boolean;
  placeholder: string;
  characterOnly: boolean;
  name: string;
}

class Select {
  show: boolean;
  label: string;
  // isValidate: boolean;
  placeholder: string;
  name: string;
  list: any[];
  dropdownSettings: DropdownSettings;
}

class DropdownSettings {
  selectSingle: boolean;
  idField: String;
  textField: String;
}

class Checkbox {
  show: boolean;
  label: string;
  name: string;
}

class Message {
  show: boolean;
  message?: string;
}

class CancelButton {
  show: boolean;
  name?: string;
}

class ConfirmButton {
  show: boolean;
  name?: string;
}
/* export enum AlertType {
  Success,
  Error,
  Info,
  Warning
} */
