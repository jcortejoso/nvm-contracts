pragma solidity 0.6.12;
// Copyright 2020 Keyko GmbH.
// SPDX-License-Identifier: (Apache-2.0 AND CC-BY-4.0)
// Code is Apache-2.0 and docs are CC-BY-4.0


import {IERC20, ILendingPool, ILendingPoolAddressesProvider, IProtocolDataProvider, IStableDebtToken, IPriceOracleGetter} from '../../../interfaces/IAaveInterfaces.sol';
import {SafeERC20, SafeMath} from '../../../libraries/AaveLibrary.sol';
import '../../../interfaces/IWETHGateway.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol';

contract AaveCreditVault is ReentrancyGuardUpgradeable, IERC721ReceiverUpgradeable {
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    
    ILendingPool private lendingPool;
    IProtocolDataProvider private dataProvider;
    IWETHGateway private weth;
    ILendingPoolAddressesProvider private addressProvider;
    IPriceOracleGetter private priceOracle;

    constructor(
        address _lendingPool,
        address _dataProvider,
        address _weth
    ) public {
        lendingPool = ILendingPool(_lendingPool);
        dataProvider = IProtocolDataProvider(_dataProvider);
        weth = IWETHGateway(_weth);
        addressProvider = lendingPool.getAddressesProvider();
        priceOracle = IPriceOracleGetter(addressProvider.getPriceOracle());        
    }

    function deposit(
        address _collateralAsset, 
        uint256 _amount
    ) 
        public
        nonReentrant
        payable 
    {
        if (msg.value == 0) _transferERC20(_collateralAsset, _amount);
        else {
            weth.depositETH{value: msg.value}(address(lendingPool), address(this), 0);
        }
    }

    function approveBorrower(
        address borrower,
        uint256 amount,
        address asset
    ) 
    public 
    {
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
     */
    function delegatedAmount(
        address borrower, 
        address asset
    )
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
     */
    function borrow(
        address _assetToBorrow,
        uint256 _amount,
        address _delgatee
    ) 
    public 
    {
        lendingPool.borrow(_assetToBorrow, _amount, 1, 0, address(this));
        IERC20(_assetToBorrow).transfer(_delgatee, _amount);
    }

    function repay(     
        address _asset
    )
    public
    {
        return repay(2**256 - 1, _asset);
    }
    /**
     * Repay an uncollaterised loan
     * @param _amount The amount to repay
     * @param _asset The asset to be repaid
     */
    function repay(
        uint256 _amount, 
        address _asset
    ) 
    public 
    {
//        require(_amount == getAssetDebt(_asset), 
//        'The amount to repay is not equal to the asset debt');
//        (uint256 _decimals,,,,,,,,,) = dataProvider.getReserveConfigurationData(_asset);
//        uint256 amountInETH = priceOracle.getAssetPrice(_asset)
//                .mul(_amount)
//                .div( 10 ** _decimals);
        //type(uint256).max   
        IERC20(_asset).approve(address(lendingPool), _amount);
        lendingPool.repay(_asset, _amount, 1, address(this));
    }

    function getAssetDebt()
    public
    view
    returns (uint256)
    {
        (,uint256 assetDebt,,,,) = lendingPool.getUserAccountData(address(this));
        return assetDebt;
        //uint256 decimals = lendingPool.getReserveData(_asset).configuration.getDecimals();
        //(uint256 decimals,,,,,,,,,)  getReserveConfigurationData();
//        (uint256 _decimals,,,,,,,,,) = dataProvider.getReserveConfigurationData(_asset);
//        return priceOracle.getAssetPrice(_asset)
//            .mul(assetDebt)
//            .div(10 ** _decimals);
    
    }

    function calculateAmountInETH(address _asset, uint256 _amount)
    public
    view
    returns (uint256)
    {
//        total deuda / total precio asset
        //        return _amountETH.div(priceOracle.getAssetPrice(_asset));
        (uint256 _decimals,,,,,,,,,) = dataProvider.getReserveConfigurationData(_asset);
        return priceOracle.getAssetPrice(_asset)
            .mul(_amount)
            .div(10 ** _decimals);

    }

    function getAssetPrice(address _asset)
    public
    view
    returns (uint256)
    {
        return priceOracle.getAssetPrice(_asset);
    }
    
    function calculateAssetDebt(address _asset, uint256 _amountETH)
    public
    view
    returns (uint256)
    {
//        (uint256 _decimals,,,,,,,,,) = dataProvider.getReserveConfigurationData(_asset);
//        return priceOracle.getAssetPrice(_asset);
        return _amountETH.div(priceOracle.getAssetPrice(_asset));
    }    
    

    /**
     * Withdraw all of a collateral as the underlying asset, if no outstanding loans delegated
     * @param _asset The underlying asset to withdraw
     * @param _delegator Delegator address that deposited the collateral
     */
    function withdrawCollateral(
        address _asset, 
        address _delegator
    ) 
        public 
    {
        (address aTokenAddress, , ) = dataProvider.getReserveTokensAddresses(
            _asset
        );
        uint256 assetBalance = IERC20(aTokenAddress).balanceOf(address(this));
        lendingPool.withdraw(_asset, assetBalance, _delegator);
    }

    function _transferERC20(
        address _collateralAsset, 
        uint256 _amount
    ) 
    internal 
    {
        IERC20Upgradeable token = ERC20Upgradeable(_collateralAsset);
        token.approve(address(lendingPool), _amount);
        lendingPool.deposit(_collateralAsset, _amount, address(this), 0);
    }

    /**
     * Always returns `IERC721Receiver.onERC721Received.selector`.
     */
    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }
    
}
