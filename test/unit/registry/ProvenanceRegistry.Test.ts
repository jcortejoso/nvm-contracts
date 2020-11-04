// @ts-ignore
const chai = require("chai")
// @ts-ignore
const { assert } = chai
const chaiAsPromised = require("chai-as-promised")
chai.use(chaiAsPromised)

const Common = artifacts.require("Common")
const ProvenanceRegistryLibrary = artifacts.require("ProvenanceRegistryLibrary")
const ProvenanceRegistry = artifacts.require("ProvenanceRegistry")
const DIDRegistryLibrary = artifacts.require("DIDRegistryLibrary")
const DIDRegistry = artifacts.require("DIDRegistry")
const testUtils = require("../../helpers/utils.js")
const constants = require("../../helpers/constants.js")

contract("ProvenanceRegistry", (accounts: string[]) => {
  const owner = accounts[1]
  const instigator = accounts[2]
  const someone = accounts[5]
  const delegates = [accounts[6], accounts[7]]
  const providers = [accounts[8], accounts[9]]
  const value = "https://exmaple.com/did/ocean/test-attr-example.txt"

  enum Activities {
    GENERATED = "0x1",
    USED = "0x2",
    ACTED_IN_BEHALF = "0x3",
  }

  async function setupTest() {
    const didRegistryLibrary = await DIDRegistryLibrary.new()
    await DIDRegistry.link("DIDRegistryLibrary", didRegistryLibrary.address)
    const didRegistry = await DIDRegistry.new()
    await didRegistry.initialize(owner)

    const provenanceRegistryLibrary = await ProvenanceRegistryLibrary.new()
    await ProvenanceRegistry.link(
      "ProvenanceRegistryLibrary",
      provenanceRegistryLibrary.address
    )
    const provenanceRegistry = await ProvenanceRegistry.new()
    await provenanceRegistry.initialize(didRegistry.address, owner)

    const common = await Common.new()

    const did = constants.did[0]
    const checksum = testUtils.generateId()
    await didRegistry.registerAttribute(did, checksum, providers, value)

    return {
      common,
      provenanceRegistry,
      didRegistry,
      did,
    }
  }

  describe("#wasGeneratedBy()", () => {
    it("should generate an entity", async () => {
      const { provenanceRegistry, did } = await setupTest()

      await provenanceRegistry.wasGeneratedBy(
        did,
        instigator,
        Activities.GENERATED,
        delegates,
        ""
      )
    })
  })

  describe("#used()", () => {
    it("should use an entity from owner", async () => {
      const { provenanceRegistry, did } = await setupTest()

      await provenanceRegistry.wasGeneratedBy(
        did,
        instigator,
        Activities.GENERATED,
        delegates,
        ""
      )
      await provenanceRegistry.used(instigator, Activities.USED, did, "")
    })

    it("should use an entity from delegate", async () => {
      const { provenanceRegistry, did } = await setupTest()

      await provenanceRegistry.wasGeneratedBy(
        did,
        instigator,
        Activities.GENERATED,
        delegates,
        ""
      )
      await provenanceRegistry.used(instigator, Activities.USED, did, "", {
        from: delegates[0],
      })
    })

    it("should fail to use an entity from someone", async () => {
      const { provenanceRegistry, did } = await setupTest()

      await provenanceRegistry.wasGeneratedBy(
        did,
        instigator,
        Activities.GENERATED,
        delegates,
        ""
      )
      await assert.isRejected(
        // must not be able to add attributes to someone else's DID
        provenanceRegistry.used(instigator, Activities.USED, did, "", {
          from: someone,
        }),
        "Invalid Provenance owner can perform this operation."
      )
    })
  })

  describe("#actedOnBehalf()", () => {
    it("should act in behalf of delegate 2", async () => {
      const { provenanceRegistry, did } = await setupTest()

      await provenanceRegistry.wasGeneratedBy(
        did,
        instigator,
        Activities.GENERATED,
        delegates,
        ""
      )
      await provenanceRegistry.actedOnBehalf(
        instigator,
        delegates[1],
        did,
        Activities.ACTED_IN_BEHALF,
        [],
        "",
        { from: delegates[0] }
      )
    })
  })
})
