//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const FiinuToken = artifacts.require("./FiinuToken.sol");
const FiinuCrowdSale = artifacts.require("./FiinuCrowdSale.sol");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const assertFail = require("./helpers/assertFail");

contract('Check Staff Allocations and Refund', function (accounts) {

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
  it("0. investor make purchases", async () => {

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

    var investor_1_balance = await fiinuToken.balanceOf(investor_1);
    var investor_2_balance = await fiinuToken.balanceOf(investor_2);
    var investor_3_balance = await fiinuToken.balanceOf(investor_3);
    var investor_4_balance = await fiinuToken.balanceOf(investor_4);

    assert.equal(investor_1_balance.toNumber(), 133333333 + 10000000, "Investor 1 should have 143.333333 tokens");
    assert.equal(investor_2_balance.toNumber(), 10000000, "Investor 2 should have 10 tokens");
    assert.equal(investor_3_balance.toNumber(), 266666666, "Investor 3 should still have 266.666666 tokens");
    assert.equal(investor_4_balance.toNumber(), 99681020733, "Investor 4 should have 99681.020733 tokens");

});

it("1. ICO successful, staff get tokens", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    await fiinuCrowdSale.Milestone_CloseTheIco("Closing Sale");
    await fiinuCrowdSale.Milestone_IcoSuccessful("ICO Successful");

    //Total tokens allocation is: 143.333333 + 10 + 266.666666 + 99681.020733 = 100101.020732
    //Total staff allocation is 10% of 100101.020732 = 10010.102073
    //Staff allocations are:
    //staff_1: 81% of 100101.020732 = 8108.182679
    //staff_2: 9% of 100101.020732 = 900.909186
    //staff_3: 1.5% of 100101.020732 = 150.151531
    //staff_4: 1.5% of 100101.020732 = 150.151531
    //staff_5: 7% of 100101.020732 = 700.707145

    var staff_1_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_1.call());
    var staff_2_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_2.call());
    var staff_3_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_3.call());
    var staff_4_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_4.call());
    var owner_balance = await fiinuToken.balanceOf(owner);

    assert.equal(staff_1_balance.toNumber(), 8108182679, "Staff 1 should have 8108.182679 tokens");
    assert.equal(staff_2_balance.toNumber(), 900909186, "Staff 2 should have 900.909186 tokens");
    assert.equal(staff_3_balance.toNumber(), 150151531, "Staff 3 should still have 150.1515310 tokens");
    assert.equal(staff_4_balance.toNumber(), 150151531, "Staff 4 should have 150.1515310 tokens");
    assert.equal(owner_balance.toNumber(), 700707145, "Owner should have 7007.071450 tokens");

});

it("2. Bank license failure, staff lose tokens, investers get refunds", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();
    //Provide some refundable funds - 50% of funds are refunded
    await fiinuCrowdSale.refund({from: admin_1, value: (100320 / 2) * ONEETHER});

    await fiinuCrowdSale.Milestone_BankLicenseFailed("Bank License Failed");
  
    // we need to open refunding
    await fiinuCrowdSale.EnableRefund();

    //All investors ask for refunds
    var investor_1_start_ether = await web3.eth.getBalance(investor_1);
    var investor_2_start_ether = await web3.eth.getBalance(investor_2);
    var investor_3_start_ether = await web3.eth.getBalance(investor_3);
    var investor_4_start_ether = await web3.eth.getBalance(investor_4);

    //Get refunds - use gasPrice of 0 to avoid accounting for lost gas
    await fiinuCrowdSale.RequestRefund({from: investor_1, gasPrice: 0});
    await fiinuCrowdSale.RequestRefund({from: investor_2, gasPrice: 0});
    await fiinuCrowdSale.RequestRefund({from: investor_3, gasPrice: 0});
    await fiinuCrowdSale.RequestRefund({from: investor_4, gasPrice: 0});

    //Check we have 50% refunds
    //invester_1 invested 110
    //invester_2 invested 10
    //invester_3 invested 200
    //invester_4 invested 100000
    var investor_1_end_ether = await web3.eth.getBalance(investor_1);
    var investor_2_end_ether = await web3.eth.getBalance(investor_2);
    var investor_3_end_ether = await web3.eth.getBalance(investor_3);
    var investor_4_end_ether = await web3.eth.getBalance(investor_4);

    assert.equal(investor_1_end_ether.sub(investor_1_start_ether).toNumber(), 55 * ONEETHER, "investor_1 should receive 55 ETH back");
    assert.equal(investor_2_end_ether.sub(investor_2_start_ether).toNumber(), 5 * ONEETHER, "investor_1 should receive 5 ETH back");
    assert.equal(investor_3_end_ether.sub(investor_3_start_ether).toNumber(), 100 * ONEETHER, "investor_1 should receive 100 ETH back");
    assert.equal(investor_4_end_ether.sub(investor_4_start_ether).toNumber(), 50000 * ONEETHER, "investor_1 should receive 50000 ETH back");

    //Everyone has 0 balance now
    var investor_1_balance = await fiinuToken.balanceOf(investor_1);
    var investor_2_balance = await fiinuToken.balanceOf(investor_2);
    var investor_3_balance = await fiinuToken.balanceOf(investor_3);
    var investor_4_balance = await fiinuToken.balanceOf(investor_4);
    var staff_1_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_1.call());
    var staff_2_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_2.call());
    var staff_3_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_3.call());
    var staff_4_balance = await fiinuToken.balanceOf(await fiinuCrowdSale.staff_4.call());
    var owner_balance = await fiinuToken.balanceOf(owner);

    assert.equal(investor_1_balance.toNumber(), 0, "Investor 1 should have 0 tokens");
    assert.equal(investor_2_balance.toNumber(), 0, "Investor 2 should have 0 tokens");
    assert.equal(investor_3_balance.toNumber(), 0, "Investor 3 should have 0 tokens");
    assert.equal(investor_4_balance.toNumber(), 0, "Investor 4 should have 0 tokens");
    assert.equal(staff_1_balance.toNumber(), 0, "Staff 1 should have 0 tokens");
    assert.equal(staff_2_balance.toNumber(), 0, "Staff 2 should have 0 tokens");
    assert.equal(staff_3_balance.toNumber(), 0, "Staff 3 should have 0 tokens");
    assert.equal(staff_4_balance.toNumber(), 0, "Staff 4 should have 0 tokens");
    assert.equal(owner_balance.toNumber(), 0, "Owner should have 0 tokens");

  });

});
