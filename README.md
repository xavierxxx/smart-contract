# Fiinu smart contract

## The Ethereum solidity smart contracts for the FNU token

We have defined in the contract 5 stages. They progress linearly in a logical manner, in exception of the last stage, which is conditional and linked to our business milestone - getting the banking license.

preICO -> ICOopen -> ICOclosed -> ICOcompleted -> BankLicenseSuccessful OR BankLicenseFailed

Please find special characteristics of each stage described below.

### preICO
This is the starting point of the FNU smart-contract.
Trading of the FNU is closed.
We are accepting investments from registered investors, who have passed our AML and KYC requirements - we white-label their addresses, including max investment limit.
Price of FNU has 33% bonus, 0.75 ETH = 1 FNU (0.75 + 33% = 1).
Minimum investment amount is 100 ETH.
Maximum ICO raise gap is 400'000 ETH.

### ICOopen
Trading of the FNU is closed.
We are accepting investments from registered investors, who have passed our AML and KYC requirements - we white-label their addresses, including max investment limit.
Price of FNU is calculated by formula = max(1, total_raised/100'000)
Up to 100'000 ETH raised against price of 1 ETH = 1 FNU, onwards the price will be calculated dynamically (in general and because of the max rais gap, the price will start from 1 ETH and will go up to a maximum of 4 ETH per 1 FNU).
There is no minimum investment requirement.
Maximum ICO raise gap is 400'000 ETH.

### ICOclosed
Trading of the FNU is closed.
Investing to smart-contract is closed.
We send out Investment Confirmation Statement as PDF to all investors

### ICOcompleted
Trading of the FNU is closed
Coin allocation for Fiinu staff

### BankLicenseSuccessful
Trading of the FNU is open

### BankLicenseFailed
Trading of the FNU is closed and investors can claim automatic refund

# Fiinu token sale bug bounty
We are excited to announce that we are conducting a bug bounty in advance of the Fiinu coin offering. Please find further clarifications down below on our bug bounty program scope, the timeline, and compensation.

## Scope
The scope of our bug bounty program focuses on Fiinu token smart contract, published:
https://github.com/fiinu/smart-contract/blob/master/FiinuCoin.sol

## Timeline
As of this post, the bug bounty program is considered started. The bounty program will continue even after the token sale.

## Compensation
We are using the OWASP risk assessment methodology to determine the bug’s level of threat (Severity) to the sale.

Severity = BUG Impact (Low(1)|Medium(2)|High(3)) x BUG Likelihood (Low(1)|Medium(2)|High(3))

- Note(1): Up to 0.5 ETH
- Low(2): Up to 3 ETH
- Medium(4): Up to 10 ETH
- High(6): Up to 30 ETH
- Critical(9): Up to 100 ETH

## Example:
An attack identified that could steal raised funds would be considered a critical threat.
If there was a way for someone to spend more tokens than owned or to mint their own, the bug would be considered a high threat.
Please note that the submission’s quality will factor into the level of compensation. A high quality submission includes an explanation of how the bug can be reproduced, a failing test case, and a fix that makes the test case pass. High quality submissions may be awarded amounts higher than the amounts specified above.
Note that bounties will be paid in ETH and that Fiinu team members and paid auditors are not eligible for bounty compensation.

## Reporting
Public disclosure of the bug or indication of an intention to exploit it on the main net will make the report ineligible for a bounty.

Please report bug bounty submissions to: support@fiinu.com
Please use subject: Smart contract bounty
