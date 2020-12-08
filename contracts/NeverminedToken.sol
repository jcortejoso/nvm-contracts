pragma solidity 0.6.12;


import 'openzeppelin-eth/contracts/token/ERC20/ERC20Capped.sol';
import 'openzeppelin-eth/contracts/token/ERC20/ERC20Detailed.sol';
import 'openzeppelin-eth/contracts/ownership/Ownable.sol';

/**
 * @title Test Token Contract
 * @author Keyko & Ocean Protocol
 *
 * @dev Implementation of a Test Token.
 *      Test Token is an ERC20 token only for testing purposes
 */
contract NeverminedToken is Ownable, ERC20Detailed, ERC20Capped {

    using SafeMath for uint256;

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

        ERC20Detailed.initialize('NeverminedToken', 'NVM', 18);
        ERC20Capped.initialize(TOTALSUPPLY, _owner);
        Ownable.initialize(_owner);

        // set initial minter, this has to be renounced after the setup!
        _addMinter(_initialMinter);
    }
}
