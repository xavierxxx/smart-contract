pragma solidity ^0.4.15;

import "./MiniMeToken.sol";
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract Milestones is Ownable {

    enum State { PreIco, IcoOpen, IcoClosed, IcoSuccessful, IcoFailed, BankLicenseSuccessful, BankLicenseFailed }

    event Milestone(string _announcement, State _state);

    State public state = State.PreIco;
    bool public tradingOpen = false;

    modifier inState(State _state) {
        require(state == _state);
        _;
    }

    modifier isTradingOpen() {
        require(tradingOpen);
        _;
    }

    function Milestone_OpenTheIco(string _announcement) onlyOwner inState(State.PreIco) {
        state = State.IcoOpen;
        Milestone(_announcement, state);
    }

    function Milestone_CloseTheIco(string _announcement) onlyOwner inState(State.IcoOpen) {
        state = State.IcoClosed;
        Milestone(_announcement, state);
    }

    function Milestone_IcoSuccessful(string _announcement) onlyOwner inState(State.IcoClosed) {
        state = State.IcoSuccessful;
        Milestone(_announcement, state);
    }

    function Milestone_IcoFailed(string _announcement) onlyOwner inState(State.IcoClosed) {
        state = State.IcoFailed;
        Milestone(_announcement, state);
    }

    function Milestone_BankLicenseSuccessful(string _announcement) onlyOwner inState(State.IcoSuccessful) {
        tradingOpen = true;
        state = State.BankLicenseSuccessful;
        Milestone(_announcement, state);
    }

    function Milestone_BankLicenseFailed(string _announcement) onlyOwner inState(State.IcoSuccessful) {
        state = State.BankLicenseFailed;
        Milestone(_announcement, state);
    }

}

contract Investors is Milestones {

    struct WhitelistEntry {
        uint max;
        uint total;
        bool init;
    }

    mapping(address => bool) internal admins;
    mapping(address => WhitelistEntry) approvedInvestors;

    modifier onlyAdmins() {
        require(admins[msg.sender] == true);
        _;
    }

    function manageInvestors(address _investors_wallet_address, uint _max_approved_investment) onlyAdmins {
        if(approvedInvestors[_investors_wallet_address].init){
            approvedInvestors[_investors_wallet_address].max = SafeMath.mul(_max_approved_investment, 10 ** 18); // ETH to WEI
            // clean up
            if(approvedInvestors[_investors_wallet_address].max == 0 && approvedInvestors[_investors_wallet_address].total == 0)
            delete approvedInvestors[_investors_wallet_address];
        }
        else{
            approvedInvestors[_investors_wallet_address] = WhitelistEntry(SafeMath.mul(_max_approved_investment, 10 ** 18), 0, true);
        }
    }

    function manageAdmins(address _address, bool _add) onlyOwner {
        admins[_address] = _add;
    }

}

contract FiinuCrowdSale is TokenController, Investors {
    using SafeMath for uint;

    event Investment(address indexed _investor, uint _valueEth, uint _valueFnu);
    event RefundAdded(address indexed _refunder, uint _valueEth);

    address wallet;
    address public staff_1 = 0x01;
    address public staff_2 = 0x02;
    address public staff_3 = 0x03;
    address public staff_4 = 0x04;

    uint constant minRaisedWei = 20000 ether;
    uint constant targetRaisedWei = 100000 ether;
    uint constant maxRaisedWei = 400000 ether;
    uint public raisedWei = 0;
    uint public refundWei = 0;

    MiniMeToken public tokenContract;   // The new token for this Campaign

    function FiinuCrowdSale(address _wallet, address _tokenAddress) {
        wallet = _wallet; // multi sig wallet
        tokenContract = MiniMeToken(_tokenAddress);// The Deployed Token Contract
    }

    /////////////////
    // TokenController interface
    /////////////////

    /// @notice `proxyPayment()` returns false, meaning ether is not accepted at
    ///  the token address, only the address of FiinuCrowdSale
    /// @param _owner The address that will hold the newly created tokens

    function proxyPayment(address _owner) payable returns(bool) {
        return false;
    }

    /// @notice Notifies the controller about a transfer, for this Campaign all
    ///  transfers are allowed by default and no extra notifications are needed
    /// @param _from The origin of the transfer
    /// @param _to The destination of the transfer
    /// @param _amount The amount of the transfer
    /// @return False if the controller does not authorize the transfer
    function onTransfer(address _from, address _to, uint _amount) returns(bool) {
        return tradingOpen;
    }

    /// @notice Notifies the controller about an approval, for this Campaign all
    ///  approvals are allowed by default and no extra notifications are needed
    /// @param _owner The address that calls `approve()`
    /// @param _spender The spender in the `approve()` call
    /// @param _amount The amount in the `approve()` call
    /// @return False if the controller does not authorize the approval
    function onApprove(address _owner, address _spender, uint _amount)
        returns(bool)
    {
        return true;
    }

    function weiToFNU(uint _wei) public constant returns (uint){
        uint _return;
        // 1 FNU = 0.75 ETH
        if(state == State.PreIco){
            _return = _wei.add(_wei.div(3));
        }
        else {
            // 1 FNU = 1 ETH
            if(raisedWei < targetRaisedWei){
                _return = _wei;
            } else {
                // 1 FNU = raisedWei / targetRaisedWei
                _return = _wei.mul(targetRaisedWei).div(raisedWei);
            }
        }
        // WEI to FNU
        return _return.div(10 ** 12);
    }

    function () payable { // incoming investment in the state of PreIco or IcoOpen

        require(msg.value != 0); // incoming transaction must have value
        require(state == State.PreIco || state == State.IcoOpen);
        require(approvedInvestors[msg.sender].init == true); // is approved investor
        require(approvedInvestors[msg.sender].max >= approvedInvestors[msg.sender].total.add(msg.value)); // investment is not breaching max approved investment amount
        require(maxRaisedWei >= raisedWei.add(msg.value)); // investment is not breaching max raising limit

        if(state == State.PreIco && msg.value < 100 ether) revert(); // PreIco condition, min amount 100 ETH

        raisedWei = raisedWei.add(msg.value);
        approvedInvestors[msg.sender].total = approvedInvestors[msg.sender].total.add(msg.value); // increase total invested
        uint _fnu = weiToFNU(msg.value);
        mint(msg.sender, _fnu); // Mint the tokens
        wallet.transfer(msg.value); // Move ETH to multi sig wallet
        Investment(msg.sender, msg.value, _fnu); // Announce investment
    }

    function refund() payable {
        require(msg.value != 0); // incoming transaction must have value
        require(state == State.IcoClosed || state == State.IcoSuccessful);
        refundWei = refundWei.add(msg.value);
        RefundAdded(msg.sender, msg.value);
    }

    function Milestone_IcoSuccessful(string _announcement) onlyOwner {
        require(raisedWei >= minRaisedWei);
        // staff allocations (actial addresses will be added later)
        uint _toBeAllocated = tokenContract.totalSupply();
        _toBeAllocated = _toBeAllocated.div(10);
        mint(staff_1, _toBeAllocated.mul(81).div(100)); // 81%
        mint(staff_2, _toBeAllocated.mul(9).div(100)); // 9%
        mint(staff_3, _toBeAllocated.mul(15).div(1000));  // 1.5%
        mint(staff_4, _toBeAllocated.mul(15).div(1000)); // 1.5%
        mint(owner, _toBeAllocated.mul(7).div(100)); // 7%
        super.Milestone_IcoSuccessful(_announcement);
    }

    function Milestone_IcoFailed(string _announcement) onlyOwner {
        require(raisedWei < minRaisedWei);
        super.Milestone_IcoFailed(_announcement);
    }
    function Milestone_BankLicenseFailed(string _announcement) onlyOwner {
        // remove staff allocations
        burn(staff_1);
        burn(staff_2);
        burn(staff_3);
        burn(staff_4);
        burn(owner);
        super.Milestone_BankLicenseFailed(_announcement);
    }
    // handle automatic refunds
    function RequestRefund() public {
        require(state == State.IcoFailed || state == State.BankLicenseFailed);
        require(tokenContract.balanceOf(msg.sender) > 0); // you must have some FNU to request refund
        // refund prorata against your ETH investment
        uint refundAmount = refundWei.mul(approvedInvestors[msg.sender].total).div(raisedWei);
        burn(msg.sender);
        msg.sender.transfer(refundAmount);
    }
    // minting possible only if State.PreIco and State.IcoOpen for () payable or State.IcoClosed for investFIAT()
    function mint(address _to, uint _tokens) internal {
        tokenContract.generateTokens(_to, _tokens);
    }
    // burning only in State.ICOcompleted for Milestone_BankLicenseFailed() or State.BankLicenseFailed for RequestRefund()
    function burn(address _address) internal {
        tokenContract.destroyTokens(_address, tokenContract.balanceOf(_address));
    }
}
