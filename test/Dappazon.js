const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

//Global constants for listing an item...
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothings";
const IMAGE = "https://picsum.photos/id/237/200/300";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Dappazon", () => {
  let dappazon;
  let deployer, buyer;
  beforeEach(async () => {
    [deployer, buyer] = await ethers.getSigners();
    //setup account
    // console.log(deployer.address, buyer.address);

    //deploy contract
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });

  describe("Deployment", () => {
    it("has the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });

  describe("Listing", () => {
    let transaction;

    beforeEach(async () => {
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);

      await transaction.wait();
    });

    it("Return items attributes", async () => {
      const item = await dappazon.items(1);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);
    });

    it("Emit List event", () => {
      expect(transaction).to.emit(dappazon, "List");
    });
  });

  describe("Buying", () => {
    let transaction;
    beforeEach(async () => {
      //List an item
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();

      //Buy an item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
    });

    it("Updates buyer's order count", async () => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });
    it("Adds the order", async () => {
      const order = await dappazon.orders(buyer.address,1);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });
    it("Update the contract Balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      // console.log(result)
      expect(result).to.equal(COST);
    });
    it("Emit buy event", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      // console.log(result)
      expect(result).to.equal(COST);
    });


  });




});
