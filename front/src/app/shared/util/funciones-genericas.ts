import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({ template: '' })

export default class FGenerico {
    public soloLetras(event: KeyboardEvent) {
        const pattern = /[a-zA-Zá-úÁ-Ú ]/;
        const inputChar = String.fromCharCode(event.charCode);

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    public soloTexto(event: Event) {
        const pattern = /[a-zA-Zá-úÁ-Ú0-9 :.,-_@#$%&+*[{}()?¿!¡\n]/;
        const inputElement = event.target as HTMLInputElement;
        const inputValue = inputElement.value;

        if (!pattern.test(inputValue)) {
            inputElement.value = inputValue.slice(0, -1);
        }
    }

    public soloNumeros(event: KeyboardEvent) {
        const pattern = /[0-9 .]/;
        const inputChar = String.fromCharCode(event.charCode);

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    public soloCoordenadas(event: KeyboardEvent) {
        const pattern = /[0-9 .,-]/;
        const inputChar = String.fromCharCode(event.charCode);

        if (!pattern.test(inputChar)) {
            event.preventDefault();
        }
    }

    public is_empty(cadena: any) {
        return cadena == null || cadena == undefined || (isNaN(cadena) && cadena.trim() == '' || cadena.length == 0);
    }

    protected obtenerFormatoNumero(telefono: string): string {
        return telefono.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }

    public obtenerSaludo(): string {
        const horaActual = new Date().getHours();

        if (horaActual >= 5 && horaActual < 12) {
            return 'buenos días';
        } else if (horaActual >= 12 && horaActual < 18) {
            return 'buenas tardes';
        } else {
            return 'buenas noches';
        }
    }

    public formatString(str: any): string {
        str = str.toString() ?? '';
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\w\s]/gi, '').replace(/ñ/g, 'n');
    }
    
    public getCurrentDateFormatted(): string {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear().toString();
      
        return `${day}-${month}-${year}`;
      }

    public adjustTextareaHeight(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight + 2) + 'px';
    }

    public esHabil = (fecha: Date): boolean => {
        const diaSemana = fecha.getDay();
        return diaSemana >= 1 && diaSemana <= 6;
    };

    public esFeriado = (fecha: Date): boolean => {
        const fechaComparacion = new Date(fecha);
        const year = fechaComparacion.toString().split(' ')[3];

        const feriados = [
            `${year}-01-01`, // Año Nuevo
            this.obtenerPrimerLunesFebrero(new Date().getFullYear()), // Día de la Constitución
            `${year}-03-18`, // Natalicio de Benito Juárez
            `${year}-05-01`, // Día del Trabajo
            `${year}-09-16`, // Día de la Independencia
            `${year}-12-25`, // Navidad
        ];

        fechaComparacion.setDate(fechaComparacion.getDate() - 1);
        return feriados.includes(fechaComparacion.toISOString().split('T')[0]);
    };

    private obtenerPrimerLunesFebrero(year: number): Date {
        let date = new Date(year, 1, 1);
      
        let dayOfWeek = date.getDay();
        let daysToAdd = (dayOfWeek === 0) ? 1 : (8 - dayOfWeek);
      
        date.setDate(date.getDate() + daysToAdd);
        return date;
      }

    public copiarPortapapeles(value: string): void {
        navigator.clipboard.writeText(value).then(() => {
            let Toast: any = Swal.mixin({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                willOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                    toast.addEventListener('click', Swal.stopTimer);
                }
            });

            Toast.fire({
                icon: 'success',
                title: 'Se copió en el portapapeles'
            });

            document.body.style.paddingRight = '';
        });
    }

    public formatDate(dateString: string, date: boolean = true, time: boolean = true): string {
        const inputDate = new Date(dateString);
        const currentDate = new Date();

        const timeDiff = currentDate.getTime() - inputDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

        const hours = inputDate.getHours();
        const minutes = inputDate.getMinutes();
        const formattedTime = this.formatTime(hours, minutes);

        if (dayDiff === 0) {
            return `Hoy ${formattedTime}`;
        } else if (dayDiff === -1) {
            return `Mañana ${formattedTime}`;
        } else if (dayDiff === -2) {
            return `Pasado mañana ${formattedTime}`;
        } else if (dayDiff === 1) {
            return `Ayer ${formattedTime}`;
        } else if (dayDiff === 2) {
            return `Antier ${formattedTime}`;
        }

        const formattedDate = this.formatDateToString(inputDate);
        return date && time ? `${formattedDate} | ${formattedTime}` : (date && !time ? formattedDate : formattedTime);
    }

    private formatDateToString(date: Date): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' }).charAt(0).toUpperCase() + date.toLocaleString('default', { month: 'short' }).slice(1);
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }    

    private formatTime(hours: number, minutes: number): string {
        const isPM = hours >= 12;
        const hour12 = hours % 12 || 12;
        const minuteStr = minutes.toString().padStart(2, '0');
        const period = isPM ? 'p. m.' : 'a. m.';
        return `${hour12}:${minuteStr} ${period}`;
    }

    public formatearNombre(nombre: any): string {
        if (typeof nombre !== 'string' || nombre.trim() === '') {
            return '';
        }
    
        const lowercaseWords = ['de', 'del', 'la', 'las', 'el', 'los', 'y'];
    
        return nombre
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
            .split(' ')
            .map((word, index) => {
                if (lowercaseWords.includes(word)) {
                    return word;
                } else if (index === 0 && word.length === 2 && word.endsWith('.')) {
                    return word.toUpperCase();
                } else if (index === 0 && word.length === 1) {
                    return word.toUpperCase();
                } else {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }
            })
            .join(' ');
    }

    public textoValido(texto: any) {
        if (typeof texto !== "string") return true;
        if (texto.length <= 10) return true;
    
        const containsLetter = /[a-zA-Z]/.test(texto);
        return !containsLetter;
    }
}