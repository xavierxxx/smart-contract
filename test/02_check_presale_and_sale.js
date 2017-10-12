//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const FiinuToken = artifacts.require("./FiinuToken.sol");
const FiinuCrowdSale = artifacts.require("./FiinuCrowdSale.sol");
const MiniMeTokenFactory = artifacts.require("MiniMeTokenFactory");

const assertFail = require("./helpers/assertFail");

contract('Check PreSale and Sale', function (accounts) {

  const ONEETHER  = 1000000000000000000;
  const gasPrice = 0;

  var admin_1 = accounts[1];
  var admin_2 = accounts[2];
  var investor_1 = accounts[3];
  var investor_2 = accounts[4];
  var investor_3 = accounts[5];
  var investor_4 = accounts[6];

  // =========================================================================
  it("0. investor purchases during presale", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();
    await fiinuCrowdSale.manageAdmins(admin_1, true, {from: accounts[0]});
    await fiinuCrowdSale.manageAdmins(admin_2, true, {from: accounts[0]});
    await fiinuCrowdSale.manageInvestors(investor_1, 110, {from: accounts[1]});
    await fiinuCrowdSale.manageInvestors(investor_2, 10, {from: accounts[2]});
    await fiinuCrowdSale.manageInvestors(investor_3, 200, {from: accounts[2]});
    await fiinuCrowdSale.manageInvestors(investor_4, 400000, {from: accounts[2]});

    //investor_2 can't invest as they don't have a high enough allocation (100 ether)
    await assertFail(async () => {
      await fiinuCrowdSale.sendTransaction({from: investor_2, value: 100 * ONEETHER});
    });

    //investor_3 can't invest more than their allocation
    await assertFail(async () => {
      await fiinuCrowdSale.sendTransaction({from: investor_3, value: 210 * ONEETHER});
    });

    //check non-investor can't invest
    await assertFail(async () => {
      await fiinuCrowdSale.sendTransaction({from: admin_1, value: 100 * ONEETHER});
    });

    await fiinuCrowdSale.sendTransaction({from: investor_1, value: 100 * ONEETHER});
    await fiinuCrowdSale.sendTransaction({from: investor_3, value: 200 * ONEETHER});

    var investor_1_balance = await fiinuToken.balanceOf(investor_1);
    var investor_2_balance = await fiinuToken.balanceOf(investor_2);
    var investor_3_balance = await fiinuToken.balanceOf(investor_3);

    assert.equal(investor_1_balance.toNumber(), 133333333, "Investor 1 should have 133.333333 tokens");
    assert.equal(investor_2_balance.toNumber(), 0, "Investor 2 should have 0 tokens");
    assert.equal(investor_3_balance.toNumber(), 266666666, "Investor 3 should have 266.666666 tokens");

  });

  it("1. checks can't transfer during presale", async () => {
    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();
    await assertFail(async () => {
      await fiinuToken.transfer(investor_2, 100000000, {from: investor_1});
    });
  });

  it("2. investor purchases during sale", async () => {

    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    await fiinuCrowdSale.Milestone_OpenTheIco("Opening Sale");

    //investor_1 can take the rest of their allocation
    await fiinuCrowdSale.sendTransaction({from: investor_1, value: 10 * ONEETHER});

    //investor_2 can now invest 10 ether
    await fiinuCrowdSale.sendTransaction({from: investor_2, value: 10 * ONEETHER});

    //invester_3 has no more allocation
    await assertFail(async () => {
      await fiinuCrowdSale.sendTransaction({from: investor_3, value: 1 * ONEETHER});
    });

    var investor_1_balance = await fiinuToken.balanceOf(investor_1);
    var investor_2_balance = await fiinuToken.balanceOf(investor_2);
    var investor_3_balance = await fiinuToken.balanceOf(investor_3);

    assert.equal(investor_1_balance.toNumber(), 133333333 + 10000000, "Investor 1 should have 143.333333 tokens");
    assert.equal(investor_2_balance.toNumber(), 10000000, "Investor 2 should have 10 tokens");
    assert.equal(investor_3_balance.toNumber(), 266666666, "Investor 3 should still have 266.666666 tokens");

  });

  it("3. checks can't transfer during sale", async () => {
    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    await assertFail(async () => {
      await fiinuToken.transfer(investor_2, 100000000, {from: investor_1});
    });
  });

  it("4. checks token allocations on targetRaisedWei reach transaction", async () => {
    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    //Purchase an amount which sends us over targetRaisedWei
    //raisedWei is 100 + 200 + 10 + 10 = 320
    //invested amount is 100000
    //targetRaisedWei is 100000
    //raisedWei will be 100000 + 100 + 200 + 10 + 10 = 100320
    //as per weiToFNU, token cost is 1 FNU = 1 ETH
    await fiinuCrowdSale.sendTransaction({from: investor_4, value: 100000 * ONEETHER});
    var investor_4_balance = await fiinuToken.balanceOf(investor_4);
    assert.equal(investor_4_balance.toNumber(), 100000000000, "Investor 4 should have 100000.000000 tokens");

  });

  it("5. checks token allocations after targetRaisedWei is met", async () => {
    var fiinuCrowdSale = await FiinuCrowdSale.deployed();
    var fiinuToken = await FiinuToken.deployed();

    //Purchase an amount after targetRaisedWei has reached
    //raisedWei is 100000 + 100 + 200 + 10 + 10 = 100320
    //targetRaisedWei is 100000
    //as per weiToFNU, token cost is 1 FNU = targetRaisedWei / raisedWei
    //(100000 / 100320) * 100000 = 99681.020733 (6 d.p.)
    await fiinuCrowdSale.sendTransaction({from: investor_4, value: 100000 * ONEETHER});
    var investor_4_balance = await fiinuToken.balanceOf(investor_4);
    assert.equal(investor_4_balance.toNumber(), 199681020733, "Investor 4 should have 199681.020733 tokens");

  });

});
