import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
	selector: 'app-dropdown',
	templateUrl: './dropdown.component.html',
	styleUrls: ['./dropdown.component.css']
})

export class DropdownComponent implements OnInit, OnChanges {
	@Input() options: any[] = [];
	@Input() font: string = '';
	@Input() type: string = 'many';
	@Input() disabled: boolean = false;
	@Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();

	selectedCount = 0;
	filteredOptions: any[] = [];
	searchText: string = '';

	constructor(private elementRef: ElementRef) { }

	ngOnInit(): void {
		this.filteredOptions = [...this.options];
		this.updateSelectedCount();
	}

	ngOnChanges(): void {
		this.options.forEach(option => {
			const existingOption = this.filteredOptions.find(item => item.value === option.value);
			if (existingOption) {
				option.checked = existingOption.checked;
			}
		});
		this.filteredOptions = [...this.options];
		this.updateSelectedCount();
	}

	closeDropdown(event: MouseEvent) {
		const dropdownMenu = this.elementRef.nativeElement.querySelector('.dropdown-menu');
		if (dropdownMenu && !dropdownMenu.contains(event.target as Node)) {
			this.filteredOptions = [...this.options];
		}
	}

	selectAllChanged(event: any) {
		const checked = event.target.checked;
		this.options.forEach(option => (option.checked = checked));
		this.filteredOptions = [...this.options];
		this.updateSelectedCount();
	}

	optionChanged(option: any) {
		if (this.type == 'simple') this.options.forEach(op => (op.checked = (op.value != option.value ? false : op.checked)));
		option.checked = !option.checked;
		this.updateSelectedCount();
	}

	filterOptions(event: Event) {
		this.searchText = (event.target as HTMLInputElement).value;
		this.filteredOptions = this.searchText
			? this.options.filter(option =>
				  option.label.toString().toLowerCase().includes(this.searchText.toLowerCase())
			  )
			: [...this.options];
	}

	allOptionsSelected(): boolean {
		return this.options.every(option => option.checked);
	}

	updateSelectedCount() {
		this.selectedCount = this.getSelectedOptions().length;
		this.updateSelection();
	}

	getSelectedOptions(): any[] {
		return this.options.filter(option => option.checked);
	}

	updateSelection() {
		const data = {
			selectedOptions: this.getSelectedOptions(),
			from: this.font
		};
		this.selectionChange.emit(data);
	}
}