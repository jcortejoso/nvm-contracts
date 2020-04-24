pragma solidity 0.5.6;


import '../../libraries/EpochLibrary.sol';


contract EpochLibraryProxy {

    using EpochLibrary for EpochLibrary.EpochList;
    using EpochLibrary for EpochLibrary.Epoch;

    EpochLibrary.Epoch epoch;
    EpochLibrary.EpochList epochList;

    function create(
        bytes32 _id,
        uint256 _timeLock,
        uint256 _timeOut
    )
        external
    {
        epochList.create(
            _id,
            _timeLock,
            _timeOut
        );
    }
}
