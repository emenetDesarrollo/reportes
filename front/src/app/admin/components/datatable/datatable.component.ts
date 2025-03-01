import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import FGenerico from 'src/app/shared/util/funciones-genericas';
import Swal from 'sweetalert2';

@Component({
	selector: 'app-datatable',
	templateUrl: './datatable.component.html',
	styleUrls: ['./datatable.component.css']
})
export class DatatableComponent extends FGenerico implements OnInit, OnChanges {
	@Input() columnasTabla: any = [];
	@Input() datosTabla: any = [];
	@Input() tableConfig: any = [];
	@Input() tableType: string = 'static';
	@Output() selectionChange: EventEmitter<any> = new EventEmitter<any>();
	@Output() actionSelected: EventEmitter<any> = new EventEmitter<any>();

	protected selectedCheckboxes: any[] = [];

	public currentPage: number = 1;
	public itemsPerPageOptions = [5, 10, 25, 50];
	public itemsPerPage = this.itemsPerPageOptions[0];

	public sortBy: string = '';
	public sortDesc: boolean = false;

	public filterValues: { [key: string]: string } = {};

	public registrosBusqueda = this.datosTabla;

	constructor(
		private cdRef: ChangeDetectorRef
	) {
		super();
	}

	ngOnInit(): void {
		this.selectedCheckboxes = [];
		this.emitirDatos();
		Object.keys(this.columnasTabla).forEach((key) => {
			this.filterValues[key] = '';
		});
		this.limpiarFiltros();
	}

	ngOnChanges(): void {
		this.selectedCheckboxes = [];
		Object.keys(this.columnasTabla).forEach((key) => {
			if (this.tableConfig[key]?.selectColumn) {
				const columnData = this.datosTabla.map((item: any) => item[key]);
				this.tableConfig[key].selectOptions = Array.from(new Set(columnData)).map((value: any) => ({
					value: value,
					label: value,
					checked: false
				}));

				if (this.tableConfig[key]?.preSelects) {
					this.tableConfig[key].selectOptions.forEach((poblacion: any) => {
						poblacion.checked = this.tableConfig[key]?.preSelects.split(',').includes(poblacion.value);
					});
				}
			}
		});
		this.emitirDatos();
		this.onItemsPerPageChange();
		this.order(this.sortBy);
	}

	get canSeeInfo() {
		const keys = Object.keys(this.tableConfig);
		const noPreSelects = keys.every(key => !this.tableConfig[key].hasOwnProperty("preSelects"));

		if (noPreSelects) return true;

		return keys.some(key => {
			if (this.tableConfig[key].hasOwnProperty("preSelects")) {
				return this.tableConfig[key].selectOptions?.some((option: any) => option.checked) || false;
			}
			return false;
		});
	}

	protected abrirOpcionesTelefono(telefono: string): void {
		Swal.fire({
			allowOutsideClick: false,
			title: "¿Que quieres hacer?",
			showDenyButton: true,
			showCancelButton: true,
			confirmButtonText: "Llamar",
			denyButtonText: 'Enviar WhatsApp',
			cancelButtonText: 'Cerrar',
			buttonsStyling: false,
			customClass: {
				confirmButton: 'order-1 btn btn-primary me-2',
				denyButton: 'order-2 btn btn-success me-2',
				cancelButton: 'order-3 btn btn-danger'
			},
		}).then((result) => {
			if (result.isConfirmed) {
				window.location.href = `tel:${telefono}`;
			} else if (result.isDenied) {
				window.location.href = `whatsapp://send?phone=+152${telefono}`;
			}
		});
	}

	private getDateDb(dateString: string): Date | null {
		const parts = dateString.split('-');
		if (parts.length === 3) {
			const day = +parts[2];
			const month = +parts[1] - 1;
			const year = +parts[0];

			return new Date(year, month, day);
		}
		return null;
	}

	private getDateInput(dateString: string): Date | null {
		const parts = dateString.split('-');
		if (parts.length === 3) {
			const day = +parts[2];
			const month = +parts[1] - 1;
			const year = +parts[0];
			return new Date(year, month, day);
		}
		return null;
	}

	get paginatedItems() {
		const startIndex = (this.currentPage - 1) * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;
	
		const datosMostrar = this.datosTabla.filter((registro: any) => {
			return Object.keys(this.filterValues).every((column: any) => {
				const filter: any = this.filterValues[column];
				let value = registro[column.replace('_inicio', '').replace('_fin', '')];
	
				if (column.endsWith('_inicio') || column.endsWith('_fin')) {
					column = column.replace('_inicio', '').replace('_fin', '');
					const startDate = this.getDateInput(this.filterValues[column + '_inicio'] ?? '');
					const endDate = this.getDateInput(this.filterValues[column + '_fin'] ?? '');
					value = this.tableConfig[column]?.dateSpForm ? value.split(' ')[0] : value;
					const dateValue = this.getDateDb(value ?? '');
	
					if (startDate && endDate && dateValue) {
						return dateValue >= startDate && dateValue <= endDate;
					}
	
					return true;
				}
	
				if (this.tableConfig[column]?.singleDate) {
					const singleDate = this.getDateInput(this.filterValues[column] ?? '');
					value = this.tableConfig[column]?.singleDate ? value.split(' ')[0] : value;
					const dateValue = this.getDateDb(value ?? '');
					
					const formattedSingleDate = this.dateFormatUnic(singleDate);
					const formattedDateValue = this.dateFormatUnic(dateValue);
				
					return formattedSingleDate && formattedDateValue ? formattedSingleDate === formattedDateValue : true;
				}
	
				if (filter === '' || filter.length == 0) {
					return true;
				} else if (this.tableConfig[column]?.showEmptyOption && filter.toLowerCase() === 'null') {
					return value === undefined || value === null || value === '';
				} else if (this.tableConfig[column]?.selectColumn) {
					return filter.includes(value);
				} else {
					return this.formatString(value ?? '').includes(this.formatString(filter ?? ''));
				}
			});
		});
	
		this.registrosBusqueda = datosMostrar;
		return datosMostrar.slice(startIndex, endIndex);
	}
	
	private dateFormatUnic(date: any): string {
		if (!date) return '';
		const dateObj = new Date(date);
		return dateObj.toISOString().split('T')[0];
	}

	get totalPages() {
		return Math.ceil(this.registrosBusqueda.length / this.itemsPerPage);
	}

	get pagesArray() {
		const visiblePages = 3;
		const halfVisible = Math.floor(visiblePages / 2);

		let startPage = Math.max(this.currentPage - halfVisible, 1);
		let endPage = startPage + visiblePages - 1;

		if (endPage > this.totalPages) {
			endPage = this.totalPages;
			startPage = Math.max(endPage - visiblePages + 1, 1);
		}

		return Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
	}

	goToPage(page: number) {
		if (page >= 1 && page <= this.totalPages) {
			this.currentPage = page;
		}
	}

	onItemsPerPageChange() {
		if (this.tableType == 'static') this.currentPage = 1;
		this.itemsPerPage = Number(this.itemsPerPage);
		this.refreshViewData();
	}

	sortColumn(indice: string) {
		if (this.sortBy === indice) {
			this.sortDesc = !this.sortDesc;
		} else {
			this.sortBy = indice;
			this.sortDesc = false;
		}

		this.order(indice);
	}

	private order(indice: any): void {
		this.datosTabla.sort((a: any, b: any) => {
			const valueA = a[indice];
			const valueB = b[indice];

			if (valueA < valueB) {
				return this.sortDesc ? 1 : -1;
			} else if (valueA > valueB) {
				return this.sortDesc ? -1 : 1;
			} else {
				return 0;
			}
		});
	}

	getColumnKeys(): string[] {
		return Object.keys(this.columnasTabla);
	}

	getStartIndex(): number {
		return (this.currentPage - 1) * this.itemsPerPage + 1;
	}

	getEndIndex(): number {
		const endIndex = this.currentPage * this.itemsPerPage;
		return Math.min(endIndex, this.datosTabla.length);
	}

	isCheckboxSelected(id: number): boolean {
		return this.selectedCheckboxes.includes(id);
	}

	toggleCheckboxSelection(event: any, id: number): void {
		if (event.target.checked) {
			this.selectedCheckboxes.push(id);
		} else {
			const index = this.selectedCheckboxes.indexOf(id);
			if (index !== -1) {
				this.selectedCheckboxes.splice(index, 1);
			}
		}

		this.emitirDatos();
	}

	limpiarFiltros(): void {
		Object.keys(this.filterValues).forEach((key) => {
			this.filterValues[key] = '';
		});

		if (this.tableType == 'static') this.currentPage = 1;
		this.cdRef.detectChanges();
	}

	getTableColumnStyle(columna: string, rowData: any): any {
		const columnConfig = this.tableConfig[columna];

		if (columnConfig && columnConfig.style) {
			const cantidad = rowData[columna];

			if (cantidad != null && cantidad > 0) {
				return columnConfig.style;
			}
		}

		return null;
	}

	private refreshViewData(): void {
		if (this.paginatedItems.length === 0) {
			for (let i = this.totalPages; i >= 1; i--) {
				if (this.datosTabla.slice((i - 1) * this.itemsPerPage, i * this.itemsPerPage).length > 0) {
					this.currentPage = i;
					break;
				}
			}
		}
	}

	protected obtenerColorDadges(columna: string, valor: string): string {
		const color = this.tableConfig[columna]?.dadgesCases.find((caseItem: any) => caseItem.text == valor);
		if (color) {
			return color.color;
		}
		return 'default';
	}

	protected actualizarFiltro(data: any): void {
		this.filterValues[data.from] = data.selectedOptions.map((objeto: any) => objeto.value);
	}

	protected calcularSumaTotal(columna: string): number {
		return this.registrosBusqueda.reduce((total: number, item: any) => total + parseFloat(item[columna] ?? 0), 0);
	}

	protected hasTotalColumn(): boolean {
		return this.paginatedItems.some((row: any) => Object.keys(row).some(key => this.tableConfig[key]?.totalColumn));
	}

	protected emitirDatos(): void {
		const data = {
			selectedOptions: this.selectedCheckboxes
		};
		this.selectionChange.emit(data);
	}

	protected emitirIdAccion(action: string, idAccion: any = null): void {
		const data = {
			action: action,
			idAccion: idAccion
		};
		this.actionSelected.emit(data);
	}
}