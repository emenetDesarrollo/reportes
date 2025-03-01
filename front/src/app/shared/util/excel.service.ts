import { Injectable } from '@angular/core';
import { MensajesService } from 'src/app/admin/services/mensajes/mensajes.service';
import * as XLSX from 'xlsx';

@Injectable({
    providedIn: 'root',
})

export class ExcelService {
    constructor(
        private mensajes: MensajesService
    ) {
    }

    public exportarExcel(data: any[], columns: { [key: string]: string }, fileName: string): void {
        if (data.length == 0) {
            this.mensajes.mensajeGenericoToast('No hay información para exportar', 'warning');
            return;
        }

        const columnNames: string[] = Object.values(columns);
        const columnKeys: string[] = Object.keys(columns);
        const filteredData = data.map((item) => {
            const filteredItem: any = {};
            for (const key of columnKeys) {
                filteredItem[key] = item[key];
            }
            return filteredItem;
        });
    
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([columnNames], { skipHeader: true });
        XLSX.utils.sheet_add_json(worksheet, filteredData, { skipHeader: true, origin: 'A2', header: columnKeys });
    
        this.autoAdjustColumnWidths(worksheet, filteredData, columnKeys);
    
        const range: XLSX.Range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        range.s.r = 0;
        range.s.c = 0;
        range.e.r = 0;
        range.e.c = columnKeys.length - 1;
    
        worksheet['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
    
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
        this.saveExcelFile(excelBuffer, fileName);
    }    

    private autoAdjustColumnWidths(worksheet: XLSX.WorkSheet, data: any[], columnKeys: string[]): void {
        const colWidths = columnKeys.map((key) => {
            const maxLength = Math.max(
                key.length,
                ...data.map(item => item[key]?.toString().length || 0)
            );
            return { wch: maxLength + 2 };
        });
    
        worksheet['!cols'] = colWidths;
    }
    

    private saveExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        const url: string = window.URL.createObjectURL(data);
        const link: HTMLAnchorElement = document.createElement('a');
        link.href = url;
        link.download = `${fileName}.xlsx`;
        link.click();
        setTimeout(() => {
            window.URL.revokeObjectURL(url);
            link.remove();
        }, 100);
        this.mensajes.mensajeGenericoToast('Excel listo!', 'success');
    }
}