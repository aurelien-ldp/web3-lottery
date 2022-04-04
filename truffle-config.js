const path = require("path");
const { alchemyApiKey, privateKey } = require("./secrets.json");
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    develop: {
      // default with truffle unbox is 7545, but we can use develop to test changes, ex. truffle migrate --network develop
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider({
          privateKeys: [privateKey],
          providerOrUrl: `https://eth-rinkeby.alchemyapi.io/v2/${alchemyApiKey}`,
        }),
      network_id: 4,
      gasPrice: 10e9,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.13",
    },
  },
};
