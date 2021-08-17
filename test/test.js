const { assert } = require('chai')

const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })

    describe('images', async () => {
      let result, imageCount, hash = 'ABC123'

      before(async () => {
        result = await decentragram.uploadImage(hash, 'Image description', { from: author })
        imageCount = await decentragram.imageCount()
      })
    

      it('creates images', async ()=> {
        // check imageCount
        assert.equal(imageCount, 1)
        //get event & check values
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), imageCount, 'id is correct')
        assert.equal(event.hash, hash, 'hash is correct')
        assert.equal(event.description, 'Image description', 'description is correct')
        assert.equal(event.tipAmount, '0', 'Tip amaunt is correct')
        assert.equal(event.author, author, 'author is correct')


        //FAILURE: image must have hash
        await decentragram.uploadImage('', 'Image Description', { from: author }).should.be.rejected;
        //FAILURE: image must have description
        await decentragram.uploadImage(hash, '', { from: author }).should.be.rejected;
        
      })

      //check struct
      it('lists images', async () => {

        const image = await decentragram.images(imageCount)

        assert.equal(image.id.toNumber(), imageCount, 'id is correct')
        assert.equal(image.hash, hash, 'hash is correct')
        assert.equal(image.description, 'Image description', 'description is correct')
        assert.equal(image.tipAmount, '0', 'Tip amaunt is correct')
        assert.equal(image.author, author, 'author is correct')

      })

      it('allows users to tip images', async () => {

        let oldAuthorBalance
        // track author balance before purchase
        oldAuthorBalance = await web3.eth.getBalance(author)
        oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

        result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether')})

        //SUCCESS
        const event = result.logs[0].args;
        assert.equal(event.id.toNumber(), imageCount, 'id is correct')
        assert.equal(event.hash, hash, 'hash is correct')
        assert.equal(event.description, 'Image description', 'description is correct')
        assert.equal(event.tipAmount, '1000000000000000000', 'Tip amaunt is correct')
        assert.equal(event.author, author, 'author is correct')

        //check the author received funds
        let newAuthorBalance
        newAuthorBalance = await web3.eth.getBalance(author)
        newAuthorBalance = new web3.utils.BN(newAuthorBalance)

        let tipImageOwner
        tipImageOwner = web3.utils.toWei('1', 'Ether')
        tipImageOwner = new web3.utils.BN(tipImageOwner)

        let expectedBalance = oldAuthorBalance.add(tipImageOwner)
        assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

        // FAULURE: try to tip image that doesn't exist
        await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
      })

    })

  })
})