// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AITU_SE2324_KV is ERC20 {
    struct TransactionInfo {
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
    }

    TransactionInfo public latestTransaction;

    constructor(uint256 _initialSupply) ERC20("AITU_SE2324_KV", "AITU") {
        _mint(msg.sender, _initialSupply * 10 ** decimals());
    }

    function transfer(address _to, uint256 _value) public override returns (bool) {
        bool success = super.transfer(_to, _value);
        if (success) {
            latestTransaction = TransactionInfo({
                sender: msg.sender,
                receiver: _to,
                amount: _value,
                timestamp: block.timestamp
            });
        }
        return success;
    }

    function transferFrom(address _from, address _to, uint256 _value) public override returns (bool) {
        bool success = super.transferFrom(_from, _to, _value);
        if (success) {
            latestTransaction = TransactionInfo({
                sender: _from,
                receiver: _to,
                amount: _value,
                timestamp: block.timestamp
            });
        }
        return success;
    }

    function getLatestTransactionTimestamp() public view returns (string memory) {
        return timestampToString(latestTransaction.timestamp);
    }

    function getTransactionSender() public view returns (address) {
        return latestTransaction.sender;
    }

    function getTransactionReceiver() public view returns (address) {
        return latestTransaction.receiver;
    }

    function timestampToString(uint256 _timestamp) internal view returns (string memory) {
    require(_timestamp <= block.timestamp, "Timestamp cannot be in the future");
    uint256 timeElapsed = block.timestamp - _timestamp;

    uint256 timeSeconds = timeElapsed % 60;
    uint256 timeMinutes = (timeElapsed / 60) % 60;
    uint256 timeHours = (timeElapsed / 3600) % 24;
    uint256 timeDays = timeElapsed / 86400;

    return string(
        abi.encodePacked(
            uint2str(timeDays), " days, ",
            uint2str(timeHours), " hours, ",
            uint2str(timeMinutes), " minutes, ",
            uint2str(timeSeconds), " seconds ago"
        )
    );
    }


    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
}
