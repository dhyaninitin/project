import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { EmployeeService } from '../services/employee.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageResizeComponent } from '../image-resize/image-resize.component';

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrls: ['./custom-editor.component.scss'],
})
export class CustomEditorComponent implements OnInit {
  @ViewChild('editor') editorRef!: ElementRef<HTMLDivElement>;
  @Output() getCustomEditorsData: EventEmitter<any> = new EventEmitter();
  getGlobalTemplateValue: any;
  getPlaceholderValue: any;
  EmployeehtmlText: any;

  private undoStack: string[] = [];
  private redoStack: string[] = [];

  constructor(private _empSer: EmployeeService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.renderHtmlToEditor();
    this.initLibraryTemplate();
  }

  @Input() set refreshEditor(value: any) {
    if (value) {
      const preview = document.querySelector<HTMLDivElement>('#preview');
      const editor = document.getElementById('editor') as HTMLDivElement;
      if (editor && preview !== null) {
        editor.innerHTML = value;
        preview.innerHTML = value;
        this.onInputChange();
      }
    }
  }

  @Input() set updateGlobalTemplateValue(value: any) {
    if (value) {
      this.getGlobalTemplateValue = value;

      const preview = document.querySelector<HTMLDivElement>('#preview');
      const editor = document.getElementById('editor') as HTMLDivElement;

      if (editor && preview !== null) {
        editor.innerHTML += this.getGlobalTemplateValue;
        preview.innerHTML += this.getGlobalTemplateValue;
        this.onInputChange();
      }
    }
  }

  @Input() set updatePlaceholderValue(value: any) {
    if (value) {
      const preview = document.querySelector<HTMLDivElement>('#preview');
      const editor = document.getElementById('editor') as HTMLDivElement;
      if (editor && preview !== null) {
        editor.innerHTML += value;
        preview.innerHTML += value;
        this.onInputChange();
      }
    }
  }

  initLibraryTemplate() {
    let html = localStorage.getItem('html');
    if (html != null) {
      this.refreshEditor = html;
      localStorage.removeItem('html');
    }
  }

  onInputChange() {
    const preview = document.querySelector<HTMLDivElement>('#preview');
    const editor = document.getElementById('editor');

    if (preview && editor) {
      this.getCustomEditorsData.emit(editor.innerHTML);
      preview.innerHTML = editor.innerHTML;
      this.undoStack.push(editor.innerHTML);
      this.redoStack = [];
    }
  }

  renderHtmlToEditor() {
    this.EmployeehtmlText = this._empSer.employeeData.filter((x) => {
      return x.stepName == 'library';
    });
    const preview = document.querySelector<HTMLDivElement>('#preview');
    const editor = document.getElementById('editor') as HTMLDivElement;
    if (editor && preview !== null && this.EmployeehtmlText.length >= 1) {
      editor.innerHTML = this.EmployeehtmlText[0]?.html;
      preview.innerHTML = this.EmployeehtmlText[0]?.html;
    }
    this.getCustomEditorsData.emit(this.EmployeehtmlText[0]?.html);
  }

  createTable() {
    let rows: any = prompt('Enter number of rows:');
    let cols: any = prompt('Enter number of columns:');

    if (rows !== null && cols !== null) {
      rows = parseInt(rows);
      cols = parseInt(cols);

      if (isNaN(rows) || isNaN(cols)) {
        alert('Invalid input: please enter numbers only.');
        return;
      }

      let table = "<table data-draggable='true'>";
      for (let i = 0; i < rows; i++) {
        table += "<tr style='border:1px solid black;padding:20px'>";
        for (let j = 0; j < cols; j++) {
          table += "<td style='border: 1px solid black; padding: 20px'></td>";
        }
        table += '</tr>';
      }
      table += '</table>';

      const editor = document.getElementById('editor');
      if (!editor) {
        console.log('Editor element not found.');
        return;
      }
      editor.insertAdjacentHTML('beforeend', table);
    }
  }

  undoText() {
    const editor = document.getElementById('editor') as HTMLElement;
    if (this.undoStack.length > 0) {
      const lastValue = this.undoStack.pop();
      if (lastValue) {
        this.redoStack.push(editor.innerHTML);
        editor.innerHTML = lastValue;
      }
    }
  }

  redoText() {
    const editor = document.getElementById('editor') as HTMLElement;
    if (this.redoStack.length > 0) {
      const nextValue = this.redoStack.pop();
      if (nextValue) {
        this.undoStack.push(editor.innerHTML);
        editor.innerHTML = nextValue;
      }
    }
  }

  applyColor(): void {
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.addEventListener('input', function () {
      document.execCommand('styleWithCSS', false);
      document.execCommand(
        'foreColor',
        false,
        (this as HTMLInputElement).value
      );
    });
    colorPicker.click();
  }

  boldText() {
    const boldButton = document.querySelector('#boldButton') as HTMLElement;
    boldButton.addEventListener('click', function () {
      performAction('bold');
    });

    function performAction(action: string): void {
      document.execCommand(action, false);
    }
  }

  italicText() {
    const italicButton = document.querySelector('#italicButton') as HTMLElement;
    italicButton.addEventListener('click', function () {
      performAction('italic');
    });

    function performAction(action: string): void {
      document.execCommand(action, false);
    }
  }

  underlineText() {
    const underlineButton = document.querySelector(
      '#underlineButton'
    ) as HTMLElement;
    underlineButton.addEventListener('click', function () {
      performAction('underline');
    });

    function performAction(action: string): void {
      document.execCommand(action, false);
    }
  }

  increaseText() {
    const increaseText = document.querySelector('#increaseText') as HTMLElement;
    increaseText.addEventListener('click', () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const h1Node = document.createElement('h1');
        const divNode = document.createElement('div');
        divNode.appendChild(range.extractContents());
        h1Node.appendChild(divNode);
        range.insertNode(h1Node);
      }
    });
  }

  decreaseText() {
    const decreaseText = document.querySelector('#decreaseText') as HTMLElement;
    decreaseText.addEventListener('click', () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const h6Node = document.createElement('h6');
        const divNode = document.createElement('div');
        divNode.appendChild(range.extractContents());
        h6Node.appendChild(divNode);
        range.insertNode(h6Node);
      }
    });
  }

  addImage() {
    this.dialog.open(ImageResizeComponent, {
      width: '500px',
      height: 'auto',
    });
  }
}
