/* This example requires Tailwind CSS v2.0+ */
import { CheckIcon, ThumbUpIcon, UserIcon } from "@heroicons/react/solid";
import { ethers } from "ethers";
import moment from "moment";

function shortenAddress(address) {
  return (
    address.substring(0, 6) + "..." + address.substring(address.length - 4)
  );
}

function linkToEtherscan(address) {
  return (
    <a
      href={"https://rinkeby.etherscan.io/address/" + address}
      className="text-indigo-500"
    >
      {shortenAddress(address)}
    </a>
  );
}

export default function Feed({ winners }) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {winners.map((winner, winnerIdx) => (
          <li key={winner.timestamp}>
            <div className="relative pb-8">
              {winnerIdx !== winners.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-green-500">
                    <CheckIcon
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {linkToEtherscan(winner.addr)} won{" "}
                      <span className="font-bold text-indigo-500">
                        {ethers.utils.formatEther(winner.amount.toNumber())}
                      </span>{" "}
                      ether
                    </p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                    <time dateTime={winner.timestamp}>
                      {moment.unix(winner.timestamp).calendar()}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
