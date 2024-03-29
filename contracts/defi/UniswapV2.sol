// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../interfaces/IERC20.sol";
import "../interfaces/IUniswap.sol";
import "hardhat/console.sol";


contract UniswapV2 {
    address private constant UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    function swap(
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        uint256 _amountOutMin,
        address _to
    ) external {
        console.log("BEFORE TRANSFER");
        IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn);
        console.log("AFTER TRANSFER");
        IERC20(_tokenIn).approve(UNISWAP_V2_ROUTER, type(uint256).max);
        console.log("APPROVE SUCCESS");

        address[] memory path;
        if (_tokenIn == WETH || _tokenOut == WETH) {
            path = new address[](2);
            path[0] = _tokenIn;
            path[1] = _tokenOut;
        } else {
            console.log("CONSTRUCTING THE PATH");
            path = new address[](2);
            path[0] = _tokenIn;
            // path[1] = WETH;
            path[1] = _tokenOut;
        }

        console.log("BEFORE SWAP");

        IUniswapV2Router(UNISWAP_V2_ROUTER).swapExactTokensForTokens(
            _amountIn,
            _amountOutMin,
            path,
            _to,
            block.timestamp
        );
    }
}
