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
    function balanceOf(address _owner) constant returns (uint balance);
    function transfer(address _to, uint _value) returns (bool success);
    function transferFrom(address _from, address _to, uint _value) returns (bool success);
    function approve(address _spender, uint _value) returns (bool success);
    function allowance(address _owner, address _spender) constant returns (uint remaining);
    event Transfer(address indexed _from, address indexed _to, uint _value);
    event Approval(address indexed _owner, address indexed _spender, uint _value);
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
    enum State { preICO, ICOopen, ICOclosed, ICOcompleted, BankLicense }
    State state;
    bool tradingOpen = false;
    function Milestones(){
        state = State.preICO;
    }
    modifier inState(State _state) {
        require(state == _state);
        _;
    }
    modifier isTradingOpen() {
        require(tradingOpen);
        _;
    }
    function OpenTheICO(string _announcement) onlyOwner inState(State.preICO) {
        Milestone(_announcement);
        state = State.ICOopen;
    }
    function CloseTheICO(string _announcement) onlyOwner inState(State.ICOopen) {
        Milestone(_announcement);
        state = State.ICOclosed;
    }
    function ConfirmBankLicense(string _announcement) onlyOwner inState(State.ICOcompleted) {
        Milestone(_announcement);
        tradingOpen = true;
        state = State.BankLicense;
    }
    event Milestone(string announcement);
}
contract StandardToken is Milestones, ERC20 {
    using SafeMath for uint;
    mapping(address => uint) balances;
    mapping(address => mapping (address => uint)) allowed;
    function transfer(address _to, uint _value) isTradingOpen returns (bool) {
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(msg.sender, _to, _value);
        return true;
    }
    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }
    function transferFrom(address _from, address _to, uint _value) isTradingOpen returns (bool) {
        var _allowance = allowed[_from][msg.sender];
        balances[_to] = balances[_to].add(_value);
        balances[_from] = balances[_from].sub(_value);
        allowed[_from][msg.sender] = _allowance.sub(_value);
        Transfer(_from, _to, _value);
        return true;
    }
    function approve(address _spender, uint _value) returns (bool) {
        require((_value == 0) || (allowed[msg.sender][_spender] == 0));
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }
    function allowance(address _owner, address _spender) constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }
}
contract Investors is StandardToken {
    mapping(address => bool) approvedInvestors;
    function manageInvestors(address _address, bool _operation) onlyOwner {
        if(_operation == true)
        approvedInvestors[_address] = true;
        else
        delete approvedInvestors[_address];
    }
}
contract FiinuToken is Investors {
    using SafeMath for uint;
    address wallet;
    string public constant name = "Fiinucoin";
    string public constant symbol = "FNU";
    uint public constant decimals = 6;
    uint constant minRaiseWei = 20000 * 10 ** 18;
    uint constant targetRaiseWei = 100000 * 10 ** 18;
    uint constant maxRaiseWei = 400000 * 10 ** 18;
    uint public raisedWei = 0;
    function FiinuToken(address _wallet) {
        wallet = _wallet;
    }
    function weiToFNU(uint _wei) internal constant returns (uint){
        uint _return;
        // 1 FNU = 0.75 ETH
        if(state == State.preICO){
            _return = _wei.add(_wei.div(3));
        }
        else {
            // 1 FNU = 1 ETH
            if(raisedWei < targetRaiseWei){
                _return = _wei;
            }
            // 1 FNU = raisedWei / targetRaiseWei
            else{
                _return = _wei.div(raisedWei.div(targetRaiseWei));
            }
        }
        // WEI to FNU
        return _return / 10 ** 12;
    }
    function () payable {
        investETH();
    }
    function investETH() payable {
        require(approvedInvestors[msg.sender] == true);
        require(state == State.preICO || state == State.ICOopen);
        require(msg.value != 0);
        require(maxRaiseWei >= raisedWei.add(msg.value));

        if(state == State.preICO && msg.value < 100 * 10 ** 18) revert();

        uint weiAmount = msg.value;
        raisedWei = raisedWei.add(weiAmount);
        mint(msg.sender, weiToFNU(weiAmount));

        TransferETH();
    }
    function investFIAT(address _to, uint _valueFIAT, uint _rateETHtoFIAT) onlyOwner {
        require(state == State.preICO || state == State.ICOopen || state == State.ICOclosed);
        require(_valueFIAT != 0);

        uint weiAmount = _valueFIAT.div(_rateETHtoFIAT) * 10 ** 18;
        raisedWei = raisedWei.add(weiAmount);
        mint(_to, weiToFNU(weiAmount));

        if(!approvedInvestors[_to]) manageInvestors(_to, true);
    }
    function CompletedICO(string _announcement) onlyOwner inState(State.ICOclosed){
        // staff allocation
        uint _toBeAllocated = totalSupply.div(10);
        mint(0x123, _toBeAllocated.div(100).mul(81));
        mint(0x123, _toBeAllocated.div(100).mul(9));
        mint(0x123, _toBeAllocated.div(1000).mul(15));
        mint(0x123, _toBeAllocated.div(1000).mul(15));
        mint(owner, _toBeAllocated.div(100).mul(7));
        Milestone(_announcement);
        state = State.ICOcompleted;
    }
    function mint(address _to, uint _tokens) internal {
        totalSupply = totalSupply.add(_tokens);
        balances[_to] = balances[_to].add(_tokens);
        Transfer(0x0, _to, _tokens);
    }
    function TransferETH() internal {
        wallet.transfer(msg.value);
    }
}
