pragma solidity ^0.4.15;

import "./MiniMeToken.sol";
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract TokenBurner {
    function burn(address , uint )
    returns (bool result) {
        return false;
    }
}

contract FiinuToken is MiniMeToken, Ownable {

    TokenBurner public tokenBurner;

    function FiinuToken(address _tokenFactory)
      MiniMeToken(
        _tokenFactory,
        0x0,                     // no parent token
        0,                       // no snapshot block number from parent
        "Fiinu Token",           // Token name
        6,                       // Decimals
        "FNU",                   // Symbol
        false                    // Enable transfers
      )
    {}

    function setTokenBurner(address _tokenBurner) onlyOwner {
      tokenBurner = TokenBurner(_tokenBurner);
    }

    // allows a token holder to burn tokens
    // requires tokenBurner to be set to a valid contract address
    // tokenBurner can take any appropriate action
    function burn(uint256 _amount) {
      uint curTotalSupply = totalSupply();
      require(curTotalSupply >= _amount);
      uint previousBalanceFrom = balanceOf(msg.sender);
      require(previousBalanceFrom >= _amount);
      updateValueAtNow(totalSupplyHistory, curTotalSupply - _amount);
      updateValueAtNow(balances[msg.sender], previousBalanceFrom - _amount);
      assert(tokenBurner.burn(msg.sender, _amount));
      Transfer(msg.sender, 0, _amount);
    }

    function destroyTokens(address _owner, uint _amount
    ) onlyController returns (bool) {
        uint curTotalSupply = totalSupply();
        require(curTotalSupply >= _amount);
        uint previousBalanceFrom = balanceOf(_owner);
        require(previousBalanceFrom >= _amount);
        updateValueAtNow(totalSupplyHistory, curTotalSupply - _amount);
        updateValueAtNow(balances[_owner], previousBalanceFrom - _amount);
        Transfer(_owner, 0, _amount);
        return true;
    }


}
