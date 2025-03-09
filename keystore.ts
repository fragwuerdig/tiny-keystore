import * as crypto from 'crypto';
import { execSync } from 'child_process';
import * as os from 'os';
import * as fs from 'fs';

export const KEY_DESCRIPTION = 'tiny_keystore';

export function homeDir() {
    const userHomeDir = os.homedir();
    return userHomeDir + `/.${KEY_DESCRIPTION}`;
}

export function getKeyId(): string {
    const cmd = `keyctl search @u user ${KEY_DESCRIPTION}`;
    const keyId = execSync(cmd).toString().trim();
    return keyId;
}

export function getKey(): string {
    const keyId = getKeyId();
    const readCommand = `keyctl print ${keyId}`;
    try {
        const keyData = execSync(readCommand).toString().trim();
        return keyData;
    } catch (error) {
        throw new Error('Error reading password');
    }
}

export class Keystore {
    store: [string, string][];

    constructor() {
        this.store = [];
    }

    addKeyValuePair(key: string, value: string) {
        this.store.push([key, value]);
    }

    getValue(key: string): string | undefined {
        const pair = this.store.find(([k, v]) => k === key);
        return pair ? pair[1] : undefined;
    }

    toJSON(): string {
        return JSON.stringify(this.store);
    }

    encrypt() {
        const password = getKey();
        const salt = crypto.randomBytes(16);
        const keyIv = crypto.pbkdf2Sync(password, salt, 100000, 48, 'sha512');
        const key = keyIv.subarray(0, 32);
        const iv = keyIv.subarray(32, 48);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(this.toJSON(), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const encryptedData = salt.toString('hex') + encrypted;
        fs.mkdirSync(homeDir(), { recursive: true });
        fs.writeFileSync(`${homeDir()}/keystore.bin`, encryptedData, 'utf8');
    }

    static decrypt(): Keystore {
        const password = getKey();
        const encrypted = fs.readFileSync(`${homeDir()}/keystore.bin`, 'utf8');
        const salt = Buffer.from(encrypted.substring(0, 32), 'hex');
        const keyIv = crypto.pbkdf2Sync(password, salt, 100000, 48, 'sha512');
        const key = keyIv.subarray(0, 32);
        const iv = keyIv.subarray(32, 48);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted.substring(32), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return this.fromJSON(decrypted);
    }

    static fromJSON(json: string): Keystore {
        const data: [string, string][] = JSON.parse(json);
        const keystore = new Keystore();
        keystore.store = data;
        return keystore;
    }
}