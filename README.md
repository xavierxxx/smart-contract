# Fiinu smart contract

## The Ethereum solidity smart contracts for the FNU token

We have defined in the contract 5 stages. They progress linearly in a logical manner, in exception of the last two stages, which are conditional and linked to our business milestones.

PreIco -> IcoOpen -> IcoClosed -> IcoSuccessful OR IcoFailed -> BankLicenseSuccessful OR BankLicenseFailed

Two business milestones
- ICO minimum target is ETH 20000 (determines if ICO was successful or fails)
- Fiinu Banking License (determines if we can operate as a Bank in the UK)

Please find special characteristics of each stage described below.

### PreIco
This is the starting point of the FNU smart-contract.
Trading of the FNU is not allowed.
We are accepting investments from registered investors, who have passed our AML and KYC requirements - we white-label their addresses, including max investment limit.
Price of FNU has 33% bonus, 0.75 ETH = 1 FNU (0.75 + 33% = 1).
Maximum ICO raise gap is 400'000 ETH.

### IcoOpen
Trading of the FNU is not allowed.
We are accepting investments from registered investors, who have passed our AML and KYC requirements - we white-label their addresses, including max investment limit.
Price of FNU is calculated by formula = max(1, total_raised/100'000)
Up to 100'000 ETH raised against the price of 1 ETH = 1 FNU, onwards the price will be calculated dynamically (in general and because of the max rais gap, the price will start from 1 ETH and will go up to a maximum of 4 ETH per 1 FNU).
Maximum ICO raise gap is 400'000 ETH.

### IcoClosed
Trading of the FNU is not allowed.
Investing to smart-contract is closed.
We send out Investment Confirmation Statement as PDF to all investors

### IcoSuccessful
Trading of the FNU is not allowed.
Coin allocation for Fiinu staff

### IcoFailed
Trading of the FNU is not allowed and investors can claim an automatic refund.

### BankLicenseSuccessful
Trading of the FNU open.
Investors, who have passed our AML and KYC requirements - we white-label their addresses, can participate on profit sharings automatically.

### BankLicenseFailed
Trading of the FNU is not allowed and investors can claim an automatic refund.

## Truffle Environment

These contracts use the Truffle build environment.

### Requirements

1. This repo uses truffle, npm and testrpc:  
https://nodejs.org/en/ (v8.4.0) 
http://truffle.readthedocs.io/en/beta/getting_started/installation/  
https://github.com/ethereumjs/testrpc

1. Run `npm install` in the repo root directory.
1. Run `npm install -g ethereumjs-testrpc`.
1. Run testrpc:  
`testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"`

## Testing

There are comprehensive test cases using the Truffle framework.

Execute `truffle test` (compile warnings are expected):
```
  Contract: Check Initialisation
    ✓ 0. check initialized token and crowdsale (97ms)

  Contract: Check Investor Intialisation
    ✓ 0. initialises two admin addresses (76ms)
    ✓ 1. adds two investors (85ms)

  Contract: Check PreSale and Sale
    ✓ 0. investor purchases during presale (508ms)
    ✓ 1. checks can't transfer during presale (66ms)
    ✓ 2. investor purchases during sale (346ms)
    ✓ 3. checks can't transfer during sale
    ✓ 4. checks token allocations on targetRaisedWei reach transaction (120ms)
    ✓ 5. checks token allocations after targetRaisedWei is met (121ms)

  Contract: Check Staff Allocations and Refund
    ✓ 0. investor make purchases (828ms)
    ✓ 1. ICO successful, staff get tokens (539ms)
    ✓ 2. Bank license failure, staff lose tokens, investers get refunds (2518ms)

  Contract: Check Token Transfers And Profit Sharing
    ✓ 0. investor make purchases, bank license issued (1354ms)
    ✓ 1. check tokens can be transferred (89ms)
    ✓ 2. Dividend paid and shared between token holders (2531ms)

15 passing (10s)
```

## Deployment

1. Execute `truffle compile` (warnings are expected):  
```
Adams-MBP:smart-contract adamdossa$ truffle compile
Compiling ./contracts/FiinuCrowdsale.sol...
Compiling ./contracts/FiinuToken.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/MiniMeToken.sol...
Compiling ./contracts/ProfitSharing.sol...
Compiling zeppelin-solidity/contracts/math/SafeMath.sol...
Compiling zeppelin-solidity/contracts/ownership/Ownable.sol...

Compilation warnings encountered:

/Users/adamdossa/Development/Ethereum/smart-contract/contracts/FiinuCrowdsale.sol:100:27: Warning: Unused local variable
    function proxyPayment(address _owner) payable returns(bool) {
                          ^------------^
,/Users/adamdossa/Development/Ethereum/smart-contract/contracts/FiinuCrowdsale.sol:110:25: Warning: Unused local variable
    function onTransfer(address _from, address _to, uint _amount) isTradingOpen returns(bool) {
                        ^-----------^
,/Users/adamdossa/Development/Ethereum/smart-contract/contracts/FiinuCrowdsale.sol:110:40: Warning: Unused local variable
    function onTransfer(address _from, address _to, uint _amount) isTradingOpen returns(bool) {
                                       ^---------^
,/Users/adamdossa/Development/Ethereum/smart-contract/contracts/FiinuCrowdsale.sol:110:53: Warning: Unused local variable
    function onTransfer(address _from, address _to, uint _amount) isTradingOpen returns(bool) {
                                                    ^----------^
,/Users/adamdossa/Development/Ethereum/smart-contract/contracts/FiinuCrowdsale.sol:120:24: Warning: Unused local variable
    function onApprove(address _owner, address _spender, uint _amount)
                       ^------------^
,/Users/adamdossa/Development/Ethereum/smart-contract/contracts/FiinuCrowdsale.sol:120:40: Warning: Unused local variable
    function onApprove(address _owner, address _spender, uint _amount)
                                       ^--------------^
,/Users/adamdossa/Development/Ethereum/smart-contract/contracts/FiinuCrowdsale.sol:120:58: Warning: Unused local variable
    function onApprove(address _owner, address _spender, uint _amount)
                                                         ^----------^

Writing artifacts to ./build/contracts
```

2. Execute `truffle migrate --reset`:  
```
Adams-MBP:smart-contract adamdossa$ truffle migrate --reset
Using network 'development'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x1d2bb82396d8fd50b6f9559fbb9dacb6091961ad711272ed3de8b7cb31b258a0
  Migrations: 0xbc9f9f9228347cf12fc79af48ff2338184f7034c
Saving successful migration to network...
  ... 0x22065ac747faf7e5a9b0dbaeea8fc35d1db8c0dd7748884840264973d694aaa2
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying MiniMeTokenFactory...
  ... 0xfc51fe15dcb74a55a7d0a35ce1ccb05c7e28b9592d872e9a43e1cbabfb50c4ec
  MiniMeTokenFactory: 0x9518b00c647dc7329137202e70eb178c8f449f17
  Deploying FiinuToken...
  ... 0x21ea96ae555d85538e968669cc3a6a02af19227286fe22582a746ea9175d395e
  FiinuToken: 0x692ad174b60c565e2121a984ddfb12796e06e6dd
  Deploying FiinuCrowdSale...
  ... 0xe8a1f42a4075ae37aa0572721e6e3bc50ca91c28cd19b59b9fa57c582910b3da
  FiinuCrowdSale: 0x137b2216d3d5e8b196c10e591acdab7b70dabec9
  Deploying ProfitSharing...
  ... 0xc291df72d3843c16621ffb9eedd24526578ea2916bf745d1f8b6d192942de8f4
  ProfitSharing: 0xbe19f0addbb41abb683b5681abee9a9f4d2e0c09
Saving successful migration to network...
  ... 0x82332899813ca8f80bfcbd4803bc154fcce895553f08a203d16d343a57dfb994
Saving artifacts...
```
