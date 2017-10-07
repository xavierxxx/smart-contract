pragma solidity ^0.4.15;

library SafeMath {
    function mul(uint a, uint b) internal constant returns (uint) {
        uint c = a * b;
        assert(a == 0 || c / a == b);
        return c;
    }
    function div(uint a, uint b) internal constant returns (uint) {
        uint c = a / b;
        return c;
    }
    function sub(uint a, uint b) internal constant returns (uint) {
        assert(b <= a);
        return a - b;
    }
    function add(uint a, uint b) internal constant returns (uint) {
        uint c = a + b;
        assert(c >= a);
        return c;
    }
}
contract ERC20 {
    uint public totalSupply;
    function balanceOf(address _owner) public constant returns (uint balance);
    function transfer(address _to, uint _value) public returns (bool success);
    function transferFrom(address _from, address _to, uint _value) public returns (bool success);
    function approve(address _spender, uint _value) public returns (bool success);
    function allowance(address _owner, address _spender) public constant returns (uint remaining);
    event Transfer(address indexed _from, address indexed _to, uint _value);
    event Approval(address indexed _owner, address indexed _spender, uint _value);
}
contract StandardToken is ERC20 {
    using SafeMath for uint;
    mapping(address => uint) balances;
    mapping(address => mapping (address => uint)) internal allowed;
    function transfer(address _to, uint _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(msg.sender, _to, _value);
        return true;
    }
    function balanceOf(address _owner) public constant returns (uint balance) {
        return balances[_owner];
    }
    function transferFrom(address _from, address _to, uint _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        Transfer(_from, _to, _value);
        return true;
    }
    function approve(address _spender, uint _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }
    function allowance(address _owner, address _spender) public constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }
    function increaseApproval (address _spender, uint _addedValue) public returns (bool success) {
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }
    function decreaseApproval (address _spender, uint _subtractedValue) public returns (bool success) {
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }
}
contract Ownable {
    address public owner;
    function Ownable() {
        owner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    function transferOwnership(address newOwner) onlyOwner {
        require(newOwner != address(0));
        owner = newOwner;
    }
}
contract Milestones is Ownable {
    enum State { PreIco, IcoOpen, IcoClosed, IcoSuccessful, IcoFailed, BankLicenseSuccessful, BankLicenseFailed }
    State internal state = State.PreIco;
    bool internal tradingOpen = false;
    modifier inState(State _state) {
        require(state == _state);
        _;
    }
    modifier isTradingOpen() {
        require(tradingOpen);
        _;
    }
    function Milestone_OpenTheIco(string _announcement) onlyOwner inState(State.PreIco) {
        Milestone(_announcement);
        state = State.IcoOpen;
    }
    function Milestone_CloseTheIco(string _announcement) onlyOwner inState(State.IcoOpen) {
        Milestone(_announcement);
        state = State.IcoClosed;
    }
    function Milestone_IcoSuccessful(string _announcement) onlyOwner inState(State.IcoClosed) {
        Milestone(_announcement);
        state = State.IcoSuccessful;
    }
    function Milestone_IcoFailed(string _announcement) onlyOwner inState(State.IcoClosed) {
        Milestone(_announcement);
        state = State.IcoFailed;
    }
    function Milestone_BankLicenseSuccessful(string _announcement) onlyOwner inState(State.IcoSuccessful) {
        Milestone(_announcement);
        tradingOpen = true;
        state = State.BankLicenseSuccessful;
    }
    function Milestone_BankLicenseFailed(string _announcement) onlyOwner inState(State.IcoSuccessful) {
        Milestone(_announcement);
        state = State.BankLicenseFailed;
    }
    event Milestone(string announcement);
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
            approvedInvestors[_investors_wallet_address].max = _max_approved_investment * 10 ** 18; // ETH to WEI
            // clean up
            if(approvedInvestors[_investors_wallet_address].max == 0 && approvedInvestors[_investors_wallet_address].total == 0)
            delete approvedInvestors[_investors_wallet_address];
        }
        else{
            approvedInvestors[_investors_wallet_address] = WhitelistEntry(_max_approved_investment * 10 ** 18, 0, true);
        }
    }
    function manageAdmins(address _address, bool _add) onlyOwner {
        admins[_address] = _add;
    }
}
contract FiinuToken is StandardToken, Investors {
    using SafeMath for uint;
    address wallet;
    string public constant name = "Fiinucoin";
    string public constant symbol = "FNU";
    uint8 public constant decimals = 6;
    uint constant minRaisedWei = 20000 ether;
    uint constant targetRaisedWei = 100000 ether;
    uint constant maxRaisedWei = 400000 ether;
    uint public raisedWei = 0;
    uint public refundWei = 0;
    function FiinuToken(address _wallet) {
        wallet = _wallet; // multi sig wallet
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
            }
            // 1 FNU = raisedWei / targetRaisedWei
            else{
                _return = _wei.mul(targetRaisedWei).div(raisedWei);
            }
        }
        // WEI to FNU
        return _return / 10 ** 12;
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
        /* TODO
        we need to change wallet.transfer push with pull method to avoid out of gas
        */
        wallet.transfer(msg.value); // Move ETH to multi sig wallet
        Investment(msg.sender, msg.value, _fnu); // Announce investment
    }
    function refund() payable {
        require(msg.value != 0); // incoming transaction must have value
        require(state == State.IcoClosed || state == State.IcoSuccessful);
        refundWei = refundWei.add(msg.value);
    }
    function shareProfits() payable inState(State.BankLicenseSuccessful) {
        require(msg.value != 0); // incoming transaction must have value
        /* TODO
        We need to share proffits prorata to FNU holders 
        */
    }
    function Milestone_IcoSuccessful(string _announcement) onlyOwner {
        require(raisedWei >= minRaisedWei);
        // staff allocations (actial addresses will be added later)
        uint _toBeAllocated = totalSupply.div(10);
        mint(0x01, _toBeAllocated.mul(81).div(100)); // 81%
        mint(0x02, _toBeAllocated.mul(9).div(100)); // 9%
        mint(0x03, _toBeAllocated.mul(15).div(1000));  // 1.5%
        mint(0x04, _toBeAllocated.mul(15).div(1000)); // 1.5%
        mint(owner, _toBeAllocated.mul(7).div(100)); // 7%
        super.Milestone_IcoSuccessful(_announcement);
    }
    function Milestone_IcoFailed(string _announcement) onlyOwner {
        require(raisedWei < minRaisedWei);
        super.Milestone_IcoFailed(_announcement);
    }
    function Milestone_BankLicenseFailed(string _announcement) onlyOwner {
        // remove staff allocations
        burn(0x01);
        burn(0x02);
        burn(0x03);
        burn(0x04);
        burn(owner);
        super.Milestone_BankLicenseFailed(_announcement);
    }
    function transfer(address _to, uint _value) isTradingOpen returns (bool) {
        return super.transfer(_to, _value);
    }
    function transferFrom(address _from, address _to, uint _value) isTradingOpen returns (bool) {
        return super.transferFrom(_from, _to, _value);
    }
    // handle automatic refunds
    function RequestRefund() public {
        require(state == State.IcoFailed || state == State.BankLicenseFailed);
        require(balances[msg.sender] > 0); // you must have some FNU to request refund
        // refund prorata against your ETH investment
        uint refundAmount = refundWei.mul(approvedInvestors[msg.sender].total).div(raisedWei);
        burn(msg.sender);
        msg.sender.transfer(refundAmount);
    }
    // minting possible only if State.PreIco and State.IcoOpen for () payable or State.IcoClosed for investFIAT()
    function mint(address _to, uint _tokens) internal {
        totalSupply = totalSupply.add(_tokens);
        balances[_to] = balances[_to].add(_tokens);
    }
    // burning only in State.ICOcompleted for Milestone_BankLicenseFailed() or State.BankLicenseFailed for RequestRefund()
    function burn(address _address) internal {
        totalSupply = totalSupply.sub(balances[_address]);
        delete balances[_address];
    }
    event ProfitShareAvailable(address addr, uint amount);
    event Investment(address indexed _investor, uint _valueEth, uint _valueFnu);
}
