pragma solidity 0.6.12;


import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20CappedUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

/**
 * @title Test Token Contract
 * @author Keyko & Ocean Protocol
 *
 * @dev Implementation of a Test Token.
 *      Test Token is an ERC20 token only for testing purposes
 */
contract NeverminedToken is OwnableUpgradeable, AccessControlUpgradeable, ERC20Upgradeable, ERC20CappedUpgradeable {

    using SafeMathUpgradeable for uint256;

    /**
    * @dev NeverminedToken Initializer
    *      Runs only on initial contract creation.
    * @param _owner refers to the owner of the contract
    * @param _initialMinter is the first token minter added
    */
    function initialize(
        address _owner,
        address _initialMinter
    )
        public
        initializer
    {
        uint256 CAP = 1500000000;
        uint256 TOTALSUPPLY = CAP.mul(10 ** 18);

        ERC20Upgradeable.__ERC20_init('NeverminedToken', 'NVM');
        ERC20CappedUpgradeable.__ERC20Capped_init(TOTALSUPPLY);
        OwnableUpgradeable.__Ownable_init();
        transferOwnership(_owner);

        // set initial minter, this has to be renounced after the setup!
        AccessControlUpgradeable.grantRole("minter", _initialMinter);
    }
}
