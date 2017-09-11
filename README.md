# Fiinu smart contract

## The Ethereum solidity smart contracts for the FNU token

We have defined in the contract 5 stages. They progress linearly in a logical manner, in exception of the last two stages, which are conditional and linked to our business milestones.

preICO -> ICOopen -> ICOclosed -> ICOSuccessful OR ICOFailed -> BankLicenseSuccessful OR BankLicenseFailed

Two business milestones
- ICO minimum target is ETH 20000 (determines if ICO was successful or fails)
- Fiinu Banking License (determines if we can operate as a Bank in the UK)

Please find special characteristics of each stage described below.

### preICO
This is the starting point of the FNU smart-contract.
Trading of the FNU is not allowed.
We are accepting investments from registered investors, who have passed our AML and KYC requirements - we white-label their addresses, including max investment limit.
Price of FNU has 33% bonus, 0.75 ETH = 1 FNU (0.75 + 33% = 1).
Minimum investment amount is 100 ETH.
Maximum ICO raise gap is 400'000 ETH.

### ICOopen
Trading of the FNU is not allowed.
We are accepting investments from registered investors, who have passed our AML and KYC requirements - we white-label their addresses, including max investment limit.
Price of FNU is calculated by formula = max(1, total_raised/100'000)
Up to 100'000 ETH raised against the price of 1 ETH = 1 FNU, onwards the price will be calculated dynamically (in general and because of the max rais gap, the price will start from 1 ETH and will go up to a maximum of 4 ETH per 1 FNU).
There is no minimum investment requirement.
Maximum ICO raise gap is 400'000 ETH.

### ICOclosed
Trading of the FNU is not allowed.
Investing to smart-contract is closed.
We send out Investment Confirmation Statement as PDF to all investors

### ICOSuccessful
Trading of the FNU is not allowed.
Coin allocation for Fiinu staff

### ICOFailed
Trading of the FNU is not allowed and investors can claim an automatic refund.

### BankLicenseSuccessful
Trading of the FNU open.
Investors, who have passed our AML and KYC requirements - we white-label their addresses, can participate on profit sharings automatically.

### BankLicenseFailed
Trading of the FNU is not allowed and investors can claim an automatic refund.
