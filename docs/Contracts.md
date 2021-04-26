# Nevermined Contracts Documentation

The Nevermined Contracts are organized in different folders. Each of them is intended to keep different Solidity
Smart Contracts code providing different building blocks or capabilities to implement the Nevermined Business Logic.

## Modules

    - [Registry](#)
        - [DID Registry](contracts/registry/DIDRegistry.md)
        - [DID Factory](contracts/registry/DIDFactory.md)
        - [NFT Upgradeable](contracts/token/erc1155/NFTUpgradeable.md)
        - [DIDRegistry Library](contracts/registry/DIDRegistryLibrary.md)
        - [Provenance Registry](contracts/registry/ProvenanceRegistry.md)

    - [Service Agreement Templates (for users usage)](#)
        - [Access Template](contracts/AccessTemplate.md)
        - [Compute Execution Template](contracts/EscrowComputeExecutionTemplate.md)
        - [DID Sales Template](contracts/DIDSalesTemplate.md)
        - [NFT Sales Template](contracts/NFTSalesTemplate.md)
        - [NFT Access Template](contracts/NFTAccessTemplate.md)
        - [Dynamic Access Template](contracts/DynamicAccessTemplate.md)

    - [Conditions (for users usage)](#)
        - [Access Condition](contracts/conditions/AccessCondition.md)
        - [Lock Payment Condition](contracts/conditions/LockPaymentCondition.md)
        - [Rewards](#)
            - [Reward](contracts/conditions/rewards/Reward.md)
            - [Escrow Payment](contracts/conditions/rewards/EscrowPayment.md)
        - [Compute Execution Condition](contracts/conditions/ComputeExecutionCondition.md)
        - [Hash Lock Condition](contracts/conditions/HashLockCondition.md)
        - [NFT Access Condition](contracts/conditions/NFTs/NFTAccessCondition.md)
        - [NFT Holder Condition](contracts/conditions/NFTs/NFTHolderCondition.md)
        - [NFT Lock Condition](contracts/conditions/NFTs/NFTLockCondition.md)
        - [Transfer DID Ownership Condition](contracts/conditions/TransferDIDOwnershipCondition.md)
        - [Transfer NFT Condition](contracts/conditions/NFTs/TransferNFTCondition.md)
        - [Sign Condition](contracts/conditions/SignCondition.md)
        - [Whitelisting Condition](contracts/conditions/WhitelistingCondition.md)
        - [Threshold Condition](contracts/conditions/ThresholdCondition.md)

    - [Agreements](#)
        - [Agreement Store Manager](contracts/agreements/AgreementStoreManager.md)
        - [Agreement Store Library](contracts/agreements/AgreementStoreLibrary.md)

    - [Libraries](#)
        - [EpochLibrary](contracts/libraries/EpochLibrary.md)
        - [HashListLibrary](contracts/libraries/HashListLibrary.md)

    - [Token](#)
        - [Nevermined Token](contracts/NeverminedToken.md)
        - [Dispenser](contracts/Dispenser.md)

    - [Interfaces](#)
        - [IList](contracts/interfaces/IList.md)
        - [ISecret Store](contracts/interfaces/ISecretStore.md)
        - [ISecret Store Permission](contracts/interfaces/ISecretStorePermission.md)

    - [Template Libraries (internal building blocks)](#)
      - [Template Store Manager](contracts/TemplateStoreManager.md)
      - [Template Store Library](contracts/TemplateStoreLibrary.md)
      - [Agreement Template](contracts/AgreementTemplate.md)

    - [Conditions (internal manager)](#)
      - [Condition Store Manager](contracts/ConditionStoreManager.md)
      - [Condition Store Library](contracts/ConditionStoreLibrary.md)
      - [Condition Base Contract](contracts/Condition.md)

    - [Common](contracts/Common.md)
    - [Hash List](HashList.md)
