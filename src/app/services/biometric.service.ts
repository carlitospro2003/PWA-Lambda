import { Injectable } from '@angular/core';
import { BiometricAuth, CheckBiometryResult } from '@aparajita/capacitor-biometric-auth';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  private readonly STORAGE_EMAIL = 'biometric_email';
  private readonly STORAGE_PASSWORD = 'biometric_password';
  private readonly STORAGE_ENABLED = 'biometric_enabled';
  private readonly ENCRYPTION_KEY = 'lambda-fitness-2025'; // Clave para encriptar

  constructor() {}

  /**
   * Verificar si el dispositivo tiene biometría disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      const result: CheckBiometryResult = await BiometricAuth.checkBiometry();
      return result.isAvailable;
    } catch (error) {
      console.error('Error checking biometry:', error);
      return false;
    }
  }

  /**
   * Verificar si el usuario tiene biometría habilitada
   */
  isBiometricEnabled(): boolean {
    return localStorage.getItem(this.STORAGE_ENABLED) === 'true';
  }

  /**
   * Guardar credenciales encriptadas
   */
  saveCredentials(email: string, password: string): void {
    const encryptedPassword = CryptoJS.AES.encrypt(password, this.ENCRYPTION_KEY).toString();
    localStorage.setItem(this.STORAGE_EMAIL, email);
    localStorage.setItem(this.STORAGE_PASSWORD, encryptedPassword);
    localStorage.setItem(this.STORAGE_ENABLED, 'true');
  }

  /**
   * Obtener credenciales desencriptadas después de verificar huella
   */
  async getCredentialsWithBiometric(): Promise<{ email: string; password: string } | null> {
    try {
      // Verificar huella
      await BiometricAuth.authenticate({
        reason: 'Usa tu huella para iniciar sesión',
        cancelTitle: 'Cancelar',
        allowDeviceCredential: false,
        iosFallbackTitle: 'Usar contraseña del dispositivo',
        androidTitle: 'Verificación biométrica',
        androidSubtitle: 'Inicia sesión con tu huella',
        androidConfirmationRequired: false
      });

      // Si llegamos aquí, la huella fue exitosa
      const email = localStorage.getItem(this.STORAGE_EMAIL);
      const encryptedPassword = localStorage.getItem(this.STORAGE_PASSWORD);

      if (!email || !encryptedPassword) {
        return null;
      }

      // Desencriptar password
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.ENCRYPTION_KEY);
      const password = bytes.toString(CryptoJS.enc.Utf8);

      return { email, password };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return null;
    }
  }

  /**
   * Obtener solo el email guardado (para mostrarlo en la UI)
   */
  getSavedEmail(): string | null {
    return localStorage.getItem(this.STORAGE_EMAIL);
  }

  /**
   * Deshabilitar autenticación biométrica
   */
  disableBiometric(): void {
    localStorage.removeItem(this.STORAGE_EMAIL);
    localStorage.removeItem(this.STORAGE_PASSWORD);
    localStorage.removeItem(this.STORAGE_ENABLED);
  }

  /**
   * Actualizar credenciales guardadas (cuando cambia la contraseña)
   */
  updatePassword(newPassword: string): void {
    const email = localStorage.getItem(this.STORAGE_EMAIL);
    if (email) {
      this.saveCredentials(email, newPassword);
    }
  }
}
