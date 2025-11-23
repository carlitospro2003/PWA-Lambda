import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class BiometricService {
  private readonly STORAGE_EMAIL = 'biometric_email';
  private readonly STORAGE_PASSWORD = 'biometric_password';
  private readonly STORAGE_ENABLED = 'biometric_enabled';
  private readonly STORAGE_CREDENTIAL_ID = 'webauthn_credential_id';
  private readonly ENCRYPTION_KEY = 'lambda-fitness-2025'; // Clave para encriptar

  constructor() {}

  /**
   * Verificar si el dispositivo tiene WebAuthn disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Verificar si WebAuthn está disponible
      if (!window.PublicKeyCredential) {
        console.log('WebAuthn no está disponible en este navegador');
        return false;
      }

      // Verificar si el dispositivo tiene authenticator disponible
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      console.log('WebAuthn disponible:', available);
      return available;
    } catch (error) {
      console.error('Error checking WebAuthn:', error);
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
   * Registrar credencial WebAuthn y guardar credenciales
   */
  async saveCredentials(email: string, password: string): Promise<boolean> {
    try {
      // Crear credencial de WebAuthn
      const challenge = this.generateChallenge();
      const userId = this.stringToArrayBuffer(email);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "Lambda Fitness",
          id: window.location.hostname // localhost o tu dominio
        },
        user: {
          id: userId,
          name: email,
          displayName: email
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" },  // ES256
          { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "none"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (credential) {
        // Guardar ID de la credencial
        const credentialId = this.arrayBufferToBase64(credential.rawId);
        localStorage.setItem(this.STORAGE_CREDENTIAL_ID, credentialId);

        // Encriptar y guardar password
        const encryptedPassword = CryptoJS.AES.encrypt(password, this.ENCRYPTION_KEY).toString();
        localStorage.setItem(this.STORAGE_EMAIL, email);
        localStorage.setItem(this.STORAGE_PASSWORD, encryptedPassword);
        localStorage.setItem(this.STORAGE_ENABLED, 'true');

        console.log('Credenciales WebAuthn guardadas exitosamente');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Error al crear credencial WebAuthn:', error);
      
      // Si el usuario cancela o hay error, no mostrar error crítico
      if (error.name === 'NotAllowedError') {
        console.log('Usuario canceló el registro biométrico');
      }
      
      return false;
    }
  }

  /**
   * Obtener credenciales después de verificar con WebAuthn
   */
  async getCredentialsWithBiometric(): Promise<{ email: string; password: string } | null> {
    try {
      const credentialId = localStorage.getItem(this.STORAGE_CREDENTIAL_ID);
      
      if (!credentialId) {
        console.error('No hay credencial registrada');
        return null;
      }

      const challenge = this.generateChallenge();
      const allowCredentials = [{
        id: this.base64ToArrayBuffer(credentialId),
        type: "public-key" as PublicKeyCredentialType,
        transports: ["internal"] as AuthenticatorTransport[]
      }];

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: allowCredentials,
        timeout: 60000,
        userVerification: "required",
        rpId: window.location.hostname
      };

      // Solicitar autenticación biométrica
      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (assertion) {
        // Autenticación exitosa, obtener credenciales guardadas
        const email = localStorage.getItem(this.STORAGE_EMAIL);
        const encryptedPassword = localStorage.getItem(this.STORAGE_PASSWORD);

        if (!email || !encryptedPassword) {
          return null;
        }

        // Desencriptar password
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, this.ENCRYPTION_KEY);
        const password = bytes.toString(CryptoJS.enc.Utf8);

        return { email, password };
      }

      return null;
    } catch (error: any) {
      console.error('Error en autenticación WebAuthn:', error);
      
      if (error.name === 'NotAllowedError') {
        console.log('Usuario canceló la autenticación');
      }
      
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
    localStorage.removeItem(this.STORAGE_CREDENTIAL_ID);
  }

  /**
   * Actualizar credenciales guardadas (cuando cambia la contraseña)
   */
  async updatePassword(newPassword: string): Promise<void> {
    const email = localStorage.getItem(this.STORAGE_EMAIL);
    if (email) {
      await this.saveCredentials(email, newPassword);
    }
  }

  // Utilidades
  private generateChallenge(): ArrayBuffer {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return array.buffer;
  }

  private stringToArrayBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}