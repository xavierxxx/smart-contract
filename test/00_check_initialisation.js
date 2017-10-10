//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const FiinuToken = artifacts.require("./FiinuToken.sol");
const FiinuCrowdSale = artifacts.require("./FiinuCrowdSale.sol");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const assertFail = require("./helpers/assertFail");

contract('Check Initialisation', function (accounts) {

  // =========================================================================
  it("0. check initialized token and crowdsale", async () => {

    //First we setup a FiinuToken and FiinuCrowdSale
    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    var crowdSaleOwner = await fiinuCrowdSale.owner();
    assert.equal(crowdSaleOwner, accounts[0], "owner is set correctly");

    var tokenOwner = await fiinuToken.owner();
    assert.equal(tokenOwner, accounts[0], "owner is set correctly");

    var tokenController = await fiinuToken.controller();
    assert.equal(tokenController, fiinuCrowdSale.address, "token controller should be crowdsale");

    var totalSupply = await fiinuToken.totalSupply();
    assert.equal(totalSupply.toNumber(), 0, "Initial totalSupply should be 0");

  });

});
