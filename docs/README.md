
setProtocol.js
==============

{Set} Protocol Library for Interacting With Smart Contracts

Note: This is pre-alpha software. Things will constantly be changing and getting updated.

Build the project by performing the following:

    $ yarn run build
    

Installation
------------

Using npm:

    $ npm i -g npm
    $ npm i --save setprotocol.js
    

Using yarn:

    $ brew install yarn
    $ yarn add setprotocol.js
    

In Node.js:

    // Import
    import SetProtocol from 'setprotocol.js';
    
    // or
    const SetProtocol = require('setprotocol.js');
    
    // Like with web3, instantiate a new instance and pass in the provider
    const setProtocolInstance = new SetProtocol(currentProvider);
    

For now, you will have to look at the source code itself for documentation, but we will be working to provide a rich set of documentation for this.

Testing
-------

##### Compile & Migrate Contracts

Start `testrpc` and setup dependencies:

    yarn chain
    

Wait until the `dependency migration complete` message appears before interacting with the contracts.

#### Testing

    yarn test:watch
    

Troubleshooting
---------------

Do not use Node version 10+ as it may have issues during `npm install` or `yarn install` with the `sha3` package. Use `nvm install 9.11.1 && nvm use 9.11.1` for now.

## Index

### External modules

* ["contracts_api"](modules/_contracts_api_.md)
* ["erc20_api"](modules/_erc20_api_.md)
* ["index"](modules/_index_.md)
* ["setToken_api"](modules/_settoken_api_.md)

---

