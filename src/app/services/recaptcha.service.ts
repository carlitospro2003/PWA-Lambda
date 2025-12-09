import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

// Declarar grecaptcha global
declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private widgetId: number | null = null;

  constructor() {}

  /**
   * Renderizar el widget de reCAPTCHA v2
   * @param containerId - ID del elemento HTML donde renderizar el widget
   * @param callback - Función que se ejecuta cuando el usuario completa el captcha
   * @param errorCallback - Función que se ejecuta en caso de error
   */
  renderRecaptcha(
    containerId: string, 
    callback: (token: string) => void, 
    errorCallback?: () => void
  ): void {
    if (!this.isRecaptchaLoaded()) {
      console.error('[RECAPTCHA] grecaptcha no está cargado');
      if (errorCallback) errorCallback();
      return;
    }

    try {
      console.log('[RECAPTCHA v2] Renderizando widget en:', containerId);
      
      this.widgetId = grecaptcha.render(containerId, {
        'sitekey': environment.recaptchaSiteKey,
        'callback': (token: string) => {
          console.log('[RECAPTCHA v2] Token obtenido del checkbox');
          callback(token);
        },
        'error-callback': () => {
          console.error('[RECAPTCHA v2] Error en verificación');
          if (errorCallback) errorCallback();
        },
        'expired-callback': () => {
          console.warn('[RECAPTCHA v2] Token expirado, debe completar nuevamente');
          if (errorCallback) errorCallback();
        }
      });
      
      console.log('[RECAPTCHA v2] Widget renderizado con ID:', this.widgetId);
    } catch (error) {
      console.error('[RECAPTCHA v2] Error al renderizar widget:', error);
      if (errorCallback) errorCallback();
    }
  }

  /**
   * Obtener el token actual del reCAPTCHA
   * @returns Token del reCAPTCHA o null si no está completo
   */
  getResponse(): string | null {
    if (!this.isRecaptchaLoaded() || this.widgetId === null) {
      return null;
    }
    const response = grecaptcha.getResponse(this.widgetId);
    return response || null;
  }

  /**
   * Resetear el widget de reCAPTCHA
   */
  reset(): void {
    if (this.isRecaptchaLoaded() && this.widgetId !== null) {
      console.log('[RECAPTCHA v2] Reseteando widget');
      grecaptcha.reset(this.widgetId);
    }
  }

  /**
   * Verificar si reCAPTCHA está cargado
   */
  isRecaptchaLoaded(): boolean {
    return typeof grecaptcha !== 'undefined' && typeof grecaptcha.render === 'function';
  }
}
