## A Teeny-Tiny Keystore

A tiny project to store/retrieve encrypted secrets with minimal user interaction.

While carrying out my crypto projects in which I made heavy use of JavaScript and node.js. I ended up storing clear text passwords in `.env` files all over the place. I started to worry about my security. This is why I made this teeny-tiny project, which wraps around `linux-keyutils` and the `keyctl` command.

It allows you to store and retrieve secrets in a secure (?) fashion, storing secrets in an encrypted keyring on disk. In the background it wraps around `keyctl`. You "unlock" your keyring by storing the decryption password for your secrets in the kernel keyring. Then other processes owned by your linux account have interactionless acess to your secrets by using the keystore lib shipped with this repository.

This way it is possible to run bots that don't require user interaction while exposing their encrypted passwords to the file system. There is a little caveat. After reboot of the OS the kernel keyring is cleared (because it's in-memory). This requires the user to interact and unlock the tiny-keystore keyring once after reboot.

### Build & Installation

Currently there is no npm package ready to download. This may be added in the future. You can use this project in 3rd party software as follows. First build this repository from source:

```
cd ~
git clone https://github.com/fragwuerdig/tiny-keystore
cd tiny-keystore
npm i
tsc
```

Install the necessary OS dependencies:

```
sudo apt install keyutils
```

After that head to the project that you want "enrich" with `tiny-keystore` and install it locally via npm:

```
cd /my/awesome/project
npm i /path/to/tiny-keystore
```

### Using It (As CLI)

1. (re-) Initialize your keystore: `tksc init`
2. lock your keystore `tksc lock`
3. unlock your keystore `tksc unlock`
4. store a key `tksc add <key-name>`

### Using It (In Your Projects)

1. Import: `import {Keystore} from 'tiny-keystore'`
2. Retrieve a keyring: `const ks = Keystore.decrypt()`
3. Retrieve a secret: `const secret = ks.getValue(<key-name>)`
4. Store a secret: `ks.addKeyValuePair(<key-name>, <secret>)`
5. Writeback to disk: `ks.encrypt()`

### Disclaimer

*Use this project only for your hot wallets that contain a workable amount of funds that you can afford to lose. Try to store as few secrets as possible. This project does not claim to be super-dooper-enterprise-millions-of-dollars secure. It is just a tiny layer of security that goes beyond "storing passwords on disk and in clear text"*