//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const ProfitSharing = artifacts.require("./mock/ProfitSharing.sol");
const FiinuToken = artifacts.require("./FiinuToken.sol");
const FiinuCrowdSale = artifacts.require("./FiinuCrowdSale.sol");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const assertFail = require("./helpers/assertFail");

contract('Check Token Transfers And Profit Sharing', function (accounts) {

  //NB - there are comprehensive unit tests for this contract found in:
  //https://github.com/adamdossa/ProfitSharingContract

  const ONEETHER  = 1000000000000000000;
  const gasPrice = 0;

  var owner = accounts[0];
  var admin_1 = accounts[1];
  var admin_2 = accounts[2];
  var investor_1 = accounts[3];
  var investor_2 = accounts[4];
  var investor_3 = accounts[5];
  var investor_4 = accounts[6];

  // =========================================================================
  it("0. investor make purchases, bank license issued", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    await fiinuCrowdSale.manageAdmins(admin_1, true, {from: accounts[0]});
    await fiinuCrowdSale.manageAdmins(admin_2, true, {from: accounts[0]});
    await fiinuCrowdSale.manageInvestors(investor_1, 110, {from: accounts[1]});
    await fiinuCrowdSale.manageInvestors(investor_2, 10, {from: accounts[2]});
    await fiinuCrowdSale.manageInvestors(investor_3, 200, {from: accounts[2]});
    await fiinuCrowdSale.manageInvestors(investor_4, 400000, {from: accounts[2]});

    await fiinuCrowdSale.sendTransaction({from: investor_1, value: 100 * ONEETHER});
    await fiinuCrowdSale.sendTransaction({from: investor_3, value: 200 * ONEETHER});

    await fiinuCrowdSale.Milestone_OpenTheIco("Opening Sale");
    await fiinuCrowdSale.sendTransaction({from: investor_1, value: 10 * ONEETHER});
    await fiinuCrowdSale.sendTransaction({from: investor_2, value: 10 * ONEETHER});
    await fiinuCrowdSale.sendTransaction({from: investor_4, value: 100000 * ONEETHER});

    await fiinuCrowdSale.Milestone_CloseTheIco("Closing Sale");
    await fiinuCrowdSale.Milestone_IcoSuccessful("ICO Successful");

    var investor_1_balance = await fiinuToken.balanceOf(investor_1);
    var investor_2_balance = await fiinuToken.balanceOf(investor_2);
    var investor_3_balance = await fiinuToken.balanceOf(investor_3);
    var investor_4_balance = await fiinuToken.balanceOf(investor_4);
    var staff_1_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_1.call());
    var staff_2_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_2.call());
    var staff_3_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_3.call());
    var staff_4_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_4.call());
    var owner_balance = await fiinuToken.balanceOf(owner);

    assert.equal(investor_1_balance.toNumber(), 133333333 + 10000000, "Investor 1 should have 143.333333 tokens");
    assert.equal(investor_2_balance.toNumber(), 10000000, "Investor 2 should have 10 tokens");
    assert.equal(investor_3_balance.toNumber(), 266666666, "Investor 3 should still have 266.666666 tokens");
    assert.equal(investor_4_balance.toNumber(), 99681020733, "Investor 4 should have 99681.020733 tokens");
    assert.equal(staff_1_balance.toNumber(), 8108182679, "Staff 1 should have 8108.182679 tokens");
    assert.equal(staff_2_balance.toNumber(), 900909186, "Staff 2 should have 900.909186 tokens");
    assert.equal(staff_3_balance.toNumber(), 150151531, "Staff 3 should still have 150.1515310 tokens");
    assert.equal(staff_4_balance.toNumber(), 150151531, "Staff 4 should have 150.1515310 tokens");
    assert.equal(owner_balance.toNumber(), 700707145, "Owner should have 7007.071450 tokens");

    await fiinuCrowdSale.Milestone_BankLicenseSuccessful("Bank License Issued");

});

it("1. check tokens can be transferred", async () => {

  var fiinuCrowdSale = await FiinuCrowdSale.deployed();
  var fiinuToken = await FiinuToken.deployed();

  await fiinuToken.transfer(investor_2, 50000000, {from: investor_1});

});

it("2. Dividend paid and shared between token holders", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();
    var profitSharing = await ProfitSharing.deployed();

    //Make a deposit - for calculation simplicity we use a dividend equal to the token totalSupply
    var totalSupply = await fiinuToken.totalSupply.call();
    await profitSharing.depositDividend({from: owner, value: totalSupply});

    //Get starting balances
    var investor_1_start_ether = await web3.eth.getBalance(investor_1);
    var investor_2_start_ether = await web3.eth.getBalance(investor_2);
    var investor_3_start_ether = await web3.eth.getBalance(investor_3);
    var investor_4_start_ether = await web3.eth.getBalance(investor_4);

    var owner_start_ether = await web3.eth.getBalance(owner);

    //Claim dividend
    //Use 0 gasPrice to avoid accounting for gas costs
    await profitSharing.claimDividend(0, {from: investor_1, gasPrice: 0});
    await profitSharing.claimDividend(0, {from: investor_2, gasPrice: 0});
    await profitSharing.claimDividend(0, {from: investor_3, gasPrice: 0});
    await profitSharing.claimDividend(0, {from: investor_4, gasPrice: 0});

    await profitSharing.claimDividend(0, {from: owner, gasPrice: 0});

    //Get ending balances
    var investor_1_end_ether = await web3.eth.getBalance(investor_1);
    var investor_2_end_ether = await web3.eth.getBalance(investor_2);
    var investor_3_end_ether = await web3.eth.getBalance(investor_3);
    var investor_4_end_ether = await web3.eth.getBalance(investor_4);

    var owner_end_ether = await web3.eth.getBalance(owner);

    //Dividend allocations should match exactly token balances
    assert.equal(investor_1_end_ether.sub(investor_1_start_ether).toNumber(), (await fiinuToken.balanceOf(investor_1)).toNumber(), "investor_1 gets dividend");
    assert.equal(investor_2_end_ether.sub(investor_2_start_ether).toNumber(), (await fiinuToken.balanceOf(investor_2)).toNumber(), "investor_2 gets dividend");
    assert.equal(investor_3_end_ether.sub(investor_3_start_ether).toNumber(), (await fiinuToken.balanceOf(investor_3)).toNumber(), "investor_3 gets dividend");
    assert.equal(investor_4_end_ether.sub(investor_4_start_ether).toNumber(), (await fiinuToken.balanceOf(investor_4)).toNumber(), "investor_4 gets dividend");

    assert.equal(owner_end_ether.sub(owner_start_ether).toNumber(), (await fiinuToken.balanceOf(owner)).toNumber(), "owner gets dividend");

  });

});
