#!/usr/bin/env node

import * as readlineSync from 'readline-sync';
import { Command } from 'commander';
import { Keystore, KEY_DESCRIPTION, getKeyId } from './keystore';
import { execSync } from 'child_process';
import { VERSION } from "./version";
import * as fs from 'fs';

function getVersion() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
}

async function keystoreInit() {
    await keystoreUnlock();
    const ks = new Keystore();
    ks.encrypt();
}

async function keystoreUnlock() {
    const password = readlineSync.question('Enter your password: ', {
        hideEchoBack: true,
    });
    const keyName = KEY_DESCRIPTION;
    const storeCommand = `keyctl add user ${keyName} ${password} @u`;
    execSync(storeCommand).toString().trim();
}

async function keystoreLock() {
    const keyId = getKeyId();
    execSync(`keyctl unlink ${keyId} @u`);
    console.log(`🔒 Key with ID ${keyId} invalidated`);
}

async function keystoreAdd(name: string) {
    const value = readlineSync.question('Enter the value: ', {
        hideEchoBack: true,
    });
    const value2 = readlineSync.question('Enter the value: ', {
        hideEchoBack: true,
    });
    if (value !== value2) {
        console.log('Values do not match');
        return;
    }
    var ks;
    try {
        ks = Keystore.decrypt();
    } catch (error) {
        console.error('Error decrypting keystore');
        return;
    }
    ks.addKeyValuePair(name, value);
    ks.encrypt();
}

async function keystoreGet(name: string) {
    var ks;
    try {
        ks = Keystore.decrypt();
    } catch (error) {
        console.error('Error decrypting keystore');
        return;
    }
    const value = ks.getValue(name);
    if (!value) {
        console.error('Key not found');
        return
    }
    console.log(value);
}

const program = new Command();

program
    .name('keystore')
    .description('CLI to manage keystore')
    .version(VERSION);

program
    .command('init')
    .description('Initialize the keystore')
    .action(async () => {
        await keystoreInit();
    });

program
    .command('unlock')
    .description('Unlock the keystore')
    .action(async () => {
        await keystoreUnlock();
    });

program
    .command('lock')
    .description('Lock the keystore')
    .action(async () => {
        await keystoreLock();
    });

program
    .command('add <name>')
    .description('Add a key-value pair to the keystore')
    .action(async (name) => {
        await keystoreAdd(name);
    });

program
    .command('get <name>')
    .description('Get a value from the keystore')
    .action(async (name) => {
        await keystoreGet(name);
    });

program.parse(process.argv);