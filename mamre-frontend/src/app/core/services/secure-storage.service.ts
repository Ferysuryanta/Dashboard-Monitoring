import { Injectable } from '@angular/core';

/**
 * Secure Storage Service
 *
 * Provides secure storage for sensitive data like tokens.
 * Features:
 * - Uses sessionStorage by default (cleared when browser closes)
 * - Simple obfuscation to prevent casual inspection
 * - Expiry time support for automatic cleanup
 * - Fallback to memory storage if sessionStorage is unavailable
 */
@Injectable({
    providedIn: 'root'
})
export class SecureStorageService {
    private memoryStorage: Map<string, string> = new Map();
    private readonly EXPIRY_SUFFIX = '_expiry';

    // Simple obfuscation key - in production, use environment-specific key
    private readonly OBFUSCATION_KEY = 'mamre_secure_2026';

    constructor() {
        // Check for expired items on service initialization
        this.cleanupExpiredItems();
    }

    /**
     * Check if sessionStorage is available
     */
    private isSessionStorageAvailable(): boolean {
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Simple obfuscation - NOT encryption, but prevents casual inspection
     * For true security, tokens should be HttpOnly cookies from backend
     */
    private obfuscate(value: string): string {
        try {
            const encoded = btoa(encodeURIComponent(value));
            // Simple XOR-like transformation
            let result = '';
            for (let i = 0; i < encoded.length; i++) {
                const charCode = encoded.charCodeAt(i) ^ this.OBFUSCATION_KEY.charCodeAt(i % this.OBFUSCATION_KEY.length);
                result += String.fromCharCode(charCode);
            }
            return btoa(result);
        } catch {
            return value;
        }
    }

    /**
     * Reverse the obfuscation
     */
    private deobfuscate(value: string): string {
        try {
            const decoded = atob(value);
            let result = '';
            for (let i = 0; i < decoded.length; i++) {
                const charCode = decoded.charCodeAt(i) ^ this.OBFUSCATION_KEY.charCodeAt(i % this.OBFUSCATION_KEY.length);
                result += String.fromCharCode(charCode);
            }
            return decodeURIComponent(atob(result));
        } catch {
            return value;
        }
    }

    /**
     * Set item with optional expiry time (in milliseconds)
     */
    setItem(key: string, value: string, expiryMs?: number): void {
        const obfuscatedValue = this.obfuscate(value);

        if (this.isSessionStorageAvailable()) {
            sessionStorage.setItem(key, obfuscatedValue);
            if (expiryMs) {
                const expiryTime = Date.now() + expiryMs;
                sessionStorage.setItem(key + this.EXPIRY_SUFFIX, expiryTime.toString());
            }
        } else {
            this.memoryStorage.set(key, obfuscatedValue);
            if (expiryMs) {
                const expiryTime = Date.now() + expiryMs;
                this.memoryStorage.set(key + this.EXPIRY_SUFFIX, expiryTime.toString());
            }
        }
    }

    /**
     * Get item - returns null if expired or not found
     */
    getItem(key: string): string | null {
        let obfuscatedValue: string | null = null;
        let expiryTime: string | null = null;

        if (this.isSessionStorageAvailable()) {
            obfuscatedValue = sessionStorage.getItem(key);
            expiryTime = sessionStorage.getItem(key + this.EXPIRY_SUFFIX);
        } else {
            obfuscatedValue = this.memoryStorage.get(key) || null;
            expiryTime = this.memoryStorage.get(key + this.EXPIRY_SUFFIX) || null;
        }

        // Check expiry
        if (expiryTime && Date.now() > parseInt(expiryTime, 10)) {
            this.removeItem(key);
            return null;
        }

        if (!obfuscatedValue) {
            return null;
        }

        return this.deobfuscate(obfuscatedValue);
    }

    /**
     * Remove item
     */
    removeItem(key: string): void {
        if (this.isSessionStorageAvailable()) {
            sessionStorage.removeItem(key);
            sessionStorage.removeItem(key + this.EXPIRY_SUFFIX);
        } else {
            this.memoryStorage.delete(key);
            this.memoryStorage.delete(key + this.EXPIRY_SUFFIX);
        }
    }

    /**
     * Clear all secure storage items
     */
    clear(): void {
        if (this.isSessionStorageAvailable()) {
            sessionStorage.clear();
        }
        this.memoryStorage.clear();
    }

    /**
     * Set item to localStorage with obfuscation (for "remember me" feature)
     * Less secure, but needed for persistent login
     */
    setItemPersistent(key: string, value: string, expiryMs?: number): void {
        const obfuscatedValue = this.obfuscate(value);

        try {
            localStorage.setItem(key, obfuscatedValue);
            if (expiryMs) {
                const expiryTime = Date.now() + expiryMs;
                localStorage.setItem(key + this.EXPIRY_SUFFIX, expiryTime.toString());
            }
        } catch {
            // Fallback to memory
            this.memoryStorage.set(key, obfuscatedValue);
        }
    }

    /**
     * Get item from localStorage
     */
    getItemPersistent(key: string): string | null {
        try {
            const obfuscatedValue = localStorage.getItem(key);
            const expiryTime = localStorage.getItem(key + this.EXPIRY_SUFFIX);

            // Check expiry
            if (expiryTime && Date.now() > parseInt(expiryTime, 10)) {
                this.removeItemPersistent(key);
                return null;
            }

            if (!obfuscatedValue) {
                return null;
            }

            return this.deobfuscate(obfuscatedValue);
        } catch {
            return this.memoryStorage.get(key) || null;
        }
    }

    /**
     * Remove item from localStorage
     */
    removeItemPersistent(key: string): void {
        try {
            localStorage.removeItem(key);
            localStorage.removeItem(key + this.EXPIRY_SUFFIX);
        } catch {
            this.memoryStorage.delete(key);
        }
    }

    /**
     * Cleanup expired items from storage
     */
    private cleanupExpiredItems(): void {
        const now = Date.now();

        // Cleanup sessionStorage
        if (this.isSessionStorageAvailable()) {
            const keysToRemove: string[] = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key?.endsWith(this.EXPIRY_SUFFIX)) {
                    const expiryTime = parseInt(sessionStorage.getItem(key) || '0', 10);
                    if (now > expiryTime) {
                        const originalKey = key.replace(this.EXPIRY_SUFFIX, '');
                        keysToRemove.push(originalKey);
                    }
                }
            }
            keysToRemove.forEach(key => this.removeItem(key));
        }

        // Cleanup localStorage
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.endsWith(this.EXPIRY_SUFFIX)) {
                    const expiryTime = parseInt(localStorage.getItem(key) || '0', 10);
                    if (now > expiryTime) {
                        const originalKey = key.replace(this.EXPIRY_SUFFIX, '');
                        keysToRemove.push(originalKey);
                    }
                }
            }
            keysToRemove.forEach(key => this.removeItemPersistent(key));
        } catch {
            // Ignore localStorage errors
        }
    }
}
