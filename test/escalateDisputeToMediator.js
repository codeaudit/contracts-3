const $util = require("./util")
const InkProtocol = artifacts.require("./mocks/InkProtocolMock.sol")

contract("InkProtocol", (accounts) => {
  let protocol
  let buyer = accounts[1]
  let seller = accounts[2]
  let unknown = accounts[accounts.length - 1]

  beforeEach(async () => {
    protocol = await InkProtocol.new()
  })

  describe("#escalateDisputeToMediator()", () => {
    it("fails for buyer", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Disputed
      })

      await $util.assertVMExceptionAsync(protocol.escalateDisputeToMediator(transaction.id, { from: buyer }))
    })

    it("fails for owner", async () => {
      let {
        protocol,
        transaction,
        owner
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Disputed,
        owner: true
      })

      await $util.assertVMExceptionAsync(owner.proxyEscalateDisputeToMediator(protocol.address, transaction.id))
    })

    it("fails for mediator", async () => {
      let {
        protocol,
        transaction,
        mediator
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Disputed
      })

      await $util.assertVMExceptionAsync(mediator.proxyEscalateDisputeToMediator(protocol.address, transaction.id))
    })

    it("fails for policy", async () => {
      let {
        protocol,
        transaction,
        policy
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Disputed
      })

      await $util.assertVMExceptionAsync(policy.proxyEscalateDisputeToMediator(protocol.address, transaction.id))
    })

    it("fails for unknown address", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Disputed
      })

      await $util.assertVMExceptionAsync(protocol.escalateDisputeToMediator(transaction.id, { from: unknown }))
    })

    it("fails when transaction does not exist", async () => {
      protocol = await InkProtocol.new()

      await $util.assertVMExceptionAsync(protocol.escalateDisputeToMediator(0))
    })

    it("emits the TransactionEscalated event", async () => {
      let {
        protocol,
        transaction
      } = await $util.buildTransaction(buyer, seller, {
        finalState: $util.states.Disputed
      })

      let tx = await protocol.escalateDisputeToMediator(transaction.id, { from: seller })
      transaction = await $util.getTransaction(transaction.id, protocol)

      assert.equal(transaction.state, $util.states.Escalated)

      let eventArgs = $util.eventFromTx(tx, $util.events.TransactionEscalated).args
      assert.equal(eventArgs.id.toNumber(), transaction.id)
    })
  })
})