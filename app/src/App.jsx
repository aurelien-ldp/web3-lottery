import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import Feed from "./Feed";

import lottery from "./contracts/Lottery.json";

const faqs = [
  {
    question: "When does the draw take place?",
    answer: "Not defined for now. Maybe once a week.",
  },
  {
    question: "How does it work?",
    answer:
      "Every user can buy one or multiple tickets. The more tickets you own, the more chance you have to win. The money is stored in the contract until the draw takes place. When the draw is triggered, the contract transfer the total balance of the contract (-2% fee) to the randomly choosen winner.",
  },
  {
    question: "How do you get randomness?",
    answer: "We rely on Chainlink VRF to securely generate random numbers.",
  },
  {
    question: "Is there any fee?",
    answer:
      "Yes. The contract redistributes 2% of the final jackpot to the owner to cover for chainlink's subscription fees.",
  },
];

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [ticketsCount, setTicketsCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [winners, setWinners] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(0);
  const [chanceOfWinning, setChanceOfWinning] = useState(0);
  const contractAddress = "0x5579124bACf71717F4a47Aa3888a0bC41958E260";
  const ticketPrice = 0.0001;
  const owner = "0x6b0a64533bae0cebee34c7e614b4cc456937d572";

  async function connectWallet(method) {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Make sure you have Metamask installed.");
        return;
      }
      const accounts = await ethereum.request({ method });

      setCurrentAccount(accounts[0]);

      const provider = new ethers.providers.Web3Provider(ethereum);

      const signer = provider.getSigner();
      const lotteryContract = new ethers.Contract(
        contractAddress,
        lottery.abi,
        signer
      );

      lotteryContract.on("TicketsBought", (buyer, amount) => {
        getTicketsCount();
      });
      lotteryContract.on("WinnerElected", (winner, amount) => {
        getTicketsCount();
      });
    } catch (error) {
      console.log(error);
    }
  }

  const buyTicket = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const network = await provider.getNetwork();

        if (network.name !== "rinkeby") {
          return alert("Please make sure you are using Rinkeby network.");
        }
        const signer = provider.getSigner();
        const lotteryContract = new ethers.Contract(
          contractAddress,
          lottery.abi,
          signer
        );

        const waveTxn = await lotteryContract.buyTickets(1, {
          value: ethers.utils.parseEther("0.0001"),
        });

        await waveTxn.wait();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const electWinner = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const lotteryContract = new ethers.Contract(
          contractAddress,
          lottery.abi,
          signer
        );

        const waveTxn = await lotteryContract.requestRandomWords({
          gasLimit: 10000000,
        });

        await waveTxn.wait();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTicketsCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const lotteryContract = new ethers.Contract(
          contractAddress,
          lottery.abi,
          signer
        );

        setTicketsCount(await lotteryContract.getOwnerTicketsCount());
        setTotalValue(await lotteryContract.getTotalValue());
      }
    } catch (error) {
      console.log(error);
    }
  };

  async function getWinners() {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const lotteryContract = new ethers.Contract(
          contractAddress,
          lottery.abi,
          signer
        );

        setCurrentDraw(await lotteryContract.currentDraw());
        for (let i = currentDraw - 1; i >= 0; i--) {
          setWinners(await lotteryContract.winners(i));
        }
        console.log(winners);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    connectWallet("eth_accounts");
    getWinners();
  }, []);

  useEffect(() => {
    getTicketsCount();
  }, [currentAccount]);

  useEffect(() => {
    setChanceOfWinning(
      (ticketsCount / (+ethers.utils.formatEther(totalValue) / ticketPrice)) *
        100 || 0
    );
  }, [ticketsCount, ticketPrice, totalValue]);

  return (
    <main>
      <div className="bg-gray-50">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-5xl">
            <span className="block">Decentralized Lottery.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            Buy a ticket for{" "}
            <span className="text-indigo-600 font-bold">0.0001</span> ether.
          </p>
          {currentAccount && (
            <div className="flex justify-center">
              <p className="mt-4 text-gray-500">
                Connected as {currentAccount}
              </p>
            </div>
          )}
          <div className="mt-8 flex justify-center">
            {currentAccount && (
              <div className="inline-flex rounded-md shadow">
                <button
                  onClick={buyTicket}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Buy 1 ticket
                </button>
              </div>
            )}
            {currentAccount === owner && (
              <div className="ml-3 inline-flex rounded-md shadow">
                <button
                  onClick={electWinner}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-white"
                >
                  Draw!
                </button>
              </div>
            )}
            {!currentAccount && (
              <div className="inline-flex rounded-md shadow">
                <button
                  onClick={() => connectWallet("eth_requestAccounts")}
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Connect wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pb-12 bg-white sm:pb-16">
        <div className="relative">
          <div className="absolute inset-0 h-1/3 bg-gray-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <dl className="rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3">
                <div className="flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                    Current Jackpot
                  </dt>
                  <dd className="order-1 text-3xl font-extrabold text-indigo-600">
                    {+ethers.utils.formatEther(totalValue)}
                  </dd>
                </div>
                <div className="flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                    Your tickets
                  </dt>
                  <dd className="order-1 text-3xl font-extrabold text-indigo-600">
                    {+ticketsCount}
                  </dd>
                </div>
                <div className="flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500">
                    Your bet
                  </dt>
                  <dd className="order-1 text-3xl font-extrabold text-indigo-600">
                    {ticketsCount * ticketPrice > 0
                      ? (ticketsCount * ticketPrice).toFixed(4)
                      : +(ticketsCount * ticketPrice)}
                  </dd>
                </div>
              </dl>
              <div className="mt-8 flex justify-center">
                <p className="mt-4 text-lg leading-6 text-gray-500">
                  ~
                  <span className="text-indigo-600 font-bold">
                    {chanceOfWinning.toFixed(1) || 0}%
                  </span>{" "}
                  chance of winning.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-12 bg-white sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
              <div className="rounded-lg bg-white shadow-lg">
                <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Winners
                  </h3>
                </div>
                <div className="bg-white flex justify-center">
                  <div className="py-6">
                    <Feed winners={winners}></Feed>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Questions?
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Keep in mind this project is for{" "}
                <span className="font-bold">educational purpose only</span> and
                does not aim to be deployed to the mainnet as is.
              </p>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-2">
              <dl className="space-y-12">
                {faqs.map((faq) => (
                  <div key={faq.question}>
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      {faq.question}
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      {faq.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
