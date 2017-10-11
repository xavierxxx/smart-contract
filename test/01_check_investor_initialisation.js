//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const FiinuToken = artifacts.require("./FiinuToken.sol");
const FiinuCrowdSale = artifacts.require("./FiinuCrowdSale.sol");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const assertFail = require("./helpers/assertFail");

contract('Check Investor Intialisation', function (accounts) {

  const ONEETHER  = 1000000000000000000;
  const gasPrice = 0;

  // =========================================================================
  it("0. initialises two admin addresses", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    var admin_1 = accounts[1];
    var admin_2 = accounts[2];

    //Check that non-owner can't do this
    await assertFail(async () => {
      await fiinuCrowdSale.manageAdmins(admin_1, true, {from: accounts[1]});
    });

    await fiinuCrowdSale.manageAdmins(admin_1, true, {from: accounts[0]});
    await fiinuCrowdSale.manageAdmins(admin_2, true, {from: accounts[0]});

  });

  it("1. adds two investors", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    var investor_1 = accounts[3];
    var investor_2 = accounts[4];

    //Check that non-admin can't do this
    await assertFail(async () => {
      await fiinuCrowdSale.manageInvestors(investor_1, 110, {from: accounts[0]});
    });

    await fiinuCrowdSale.manageInvestors(investor_1, 110, {from: accounts[1]});
    await fiinuCrowdSale.manageInvestors(investor_2, 10, {from: accounts[2]});

  });

});
