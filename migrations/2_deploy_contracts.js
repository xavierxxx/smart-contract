var MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");
var FiinuToken = artifacts.require("./FiinuToken.sol");
var FiinuCrowdSale = artifacts.require("./FiinuCrowdSale.sol");
var ProfitSharing = artifacts.require("./ProfitSharing.sol");

//Need to set the below to actual wallet!
var wallet = web3.eth.accounts[1];

//Owner of below contracts will be truffle deployment address
module.exports = function(deployer) {
  deployer.deploy(MiniMeTokenFactory).then(function() {
    return deployer.deploy(FiinuToken, MiniMeTokenFactory.address);
  }).then(function () {
    return deployer.deploy(FiinuCrowdSale, wallet, FiinuToken.address);
  }).then(function () {
    return FiinuToken.deployed();
  }).then(function (fiinuToken) {
    return fiinuToken.changeController(FiinuCrowdSale.address);
  }).then(function () {
    return deployer.deploy(ProfitSharing, FiinuToken.address);
  });
};
