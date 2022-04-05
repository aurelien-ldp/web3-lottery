//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VRFv2Consumer.sol";

contract Lottery is VRFv2Consumer {
    uint32 public currentDraw = 0;
    uint256 public ticketPrice = 0.0001 ether;
    uint256 public ownerFeePercentage = 2;
    mapping(uint256 => address[]) private drawAttendees;
    mapping(uint256 => mapping(address => uint256))
        private drawAttendeeTicketsCount;

    struct Winner {
        address addr;
        uint amount;
        uint32 draw;
        uint32 timestamp;
    }

    Winner[] public winners;

    event TicketsBought(address buyer, uint256 amount);
    event WinnerElected(address winner, uint256 earnedAmount);

    constructor() VRFv2Consumer(1587) {}

    function setTicketPrice(uint256 price) external onlyOwner {
        require(price > 0);
        ticketPrice = price;
    }

    function setOwnerFeePercentage(uint256 fee) external onlyOwner {
        require(fee >= 0 && fee < 100);
        ownerFeePercentage = fee;
    }

    function getWinners() public view returns (Winner[] memory) {
        return winners;
    }

    function buyTickets(uint256 amount) external payable {
        require(amount < 20);
        require(drawAttendeeTicketsCount[currentDraw][msg.sender] <= 40);
        require(msg.value == amount * ticketPrice);
        for (uint256 i = 0; i < amount; i++) {
            drawAttendees[currentDraw].push(msg.sender);
        }
        drawAttendeeTicketsCount[currentDraw][msg.sender] += amount;
        emit TicketsBought(msg.sender, amount);
    }

    function getOwnerTicketsCount() public view returns (uint256) {
        return drawAttendeeTicketsCount[currentDraw][msg.sender];
    }

    function getTotalValue() public view returns (uint256) {
        return address(this).balance;
    }

    function designateWinner() internal {
        uint256 rand = s_randomWords[0];
        address winner = drawAttendees[currentDraw][
            rand % drawAttendees[currentDraw].length
        ];
        uint256 fee = (address(this).balance * ownerFeePercentage) / 100;

        (bool feeSuccess, ) = s_owner.call{value: fee}("");
        require(feeSuccess);

        uint256 amount = address(this).balance;
        (bool success, ) = winner.call{value: amount}("");
        require(success);

        emit WinnerElected(winner, amount);
        winners.push(
            Winner(winner, amount, currentDraw, uint32(block.timestamp))
        );
        currentDraw += 1;
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        s_randomWords = randomWords;
        designateWinner();
    }
}
