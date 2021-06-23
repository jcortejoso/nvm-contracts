// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {IERC20, ILendingPool, IProtocolDataProvider, IStableDebtToken} from "./interfaces/IAaveInterfaces.sol";
import {SafeERC20} from "./libraries/AaveLibrary.sol";
import "./interfaces/IWETHGateway.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract AaveCreditVault {
  using SafeERC20 for IERC20;

  ILendingPool private lendingPool;
  IProtocolDataProvider private dataProvider;
  IWETHGateway private weth;

  constructor(
    address _lendingPool,
    address _dataProvider,
    address _weth
  ) public {
    lendingPool = ILendingPool(_lendingPool);
    dataProvider = IProtocolDataProvider(_dataProvider);
    weth = IWETHGateway(_weth);
  }

  function deposit(address _collateralAsset, uint256 _amount) public payable {
    if (msg.value == 0) _transferERC20(_collateralAsset, _amount);
    else {
      weth.depositETH{value: msg.value}(address(lendingPool), address(this), 0);
    }
  }

  function approveBorrower(
    address borrower,
    uint256 amount,
    address asset
  ) public {
    (, address stableDebtTokenAddress, ) = dataProvider
    .getReserveTokensAddresses(asset);
    IStableDebtToken(stableDebtTokenAddress).approveDelegation(
      borrower,
      amount
    );
  }

  /**
   * Return the actual delegated amount for the borrower in the specific asset
   * @param borrower The borrower of the funds (i.e. delgatee)
   * @param asset The asset they are allowed to borrow
   *
   */
  function delegatedAmount(address borrower, address asset)
    public
    view
    returns (uint256)
  {
    (, address stableDebtTokenAddress, ) = dataProvider
    .getReserveTokensAddresses(asset);

    return
      IStableDebtToken(stableDebtTokenAddress).borrowAllowance(
        address(this),
        borrower
      );
  }

  /**
   * Borrower can call this function to borrow the delegated funds
   * @param _assetToBorrow The asset they are allowed to borrow
   * @param _amount Amount to borrow
   * @param _delgatee Address where the funds will be transfered
   *
   */
  function borrow(
    address _assetToBorrow,
    uint256 _amount,
    address _delgatee
  ) public {
    lendingPool.borrow(_assetToBorrow, _amount, 1, 0, address(this));
    IERC20(_assetToBorrow).transfer(_delgatee, _amount);
  }

  /**
   * Repay an uncollaterised loan
   * @param _amount The amount to repay
   * @param _asset The asset to be repaid
   *
   */
  function repay(uint256 _amount, address _asset) public {
    IERC20(_asset).approve(address(lendingPool), _amount);
    lendingPool.repay(_asset, _amount, 1, address(this));
  }

  /**
   * Withdraw all of a collateral as the underlying asset, if no outstanding loans delegated
   * @param _asset The underlying asset to withdraw
   * @param _delegator Delegator address that deposited the collateral
   *
   */
  function withdrawCollateral(address _asset, address _delegator) public {
    (address aTokenAddress, , ) = dataProvider.getReserveTokensAddresses(
      _asset
    );
    uint256 assetBalance = IERC20(aTokenAddress).balanceOf(address(this));
    lendingPool.withdraw(_asset, assetBalance, _delegator);
  }

  function _transferERC20(address _collateralAsset, uint256 _amount) internal {
    IERC20Upgradeable token = ERC20Upgradeable(_collateralAsset);
    token.approve(address(lendingPool), _amount);
    lendingPool.deposit(_collateralAsset, _amount, address(this), 0);
  }
}
