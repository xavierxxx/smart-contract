# Fiinu smart-contract
The Ethereum solidity smart contracts for the fii.nu project

## Fiinu token sale bug bounty
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

# Reporting
Public disclosure of the bug or indication of an intention to exploit it on the main net will make the report ineligible for a bounty.

Please report bug bounty submissions to: security-ico@fiinu.com
