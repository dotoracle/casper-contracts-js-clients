import { config } from "dotenv";
config({ path: "./.env.erc20" });

import { ERC20Client } from "casper-erc20-js-client";
import { utils } from "casper-js-client-helper";
import { sleep, getDeploy } from "../utils";
import { BigNumber } from "bignumber.js";
import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLPublicKeyType,
  CLAccountHash,
  CasperServiceByJsonRPC
} from "casper-js-sdk";

const {
  NODE_ADDRESS,
  EVENT_STREAM_ADDRESS,
  CHAIN_NAME,
  WASM_PATH,
  MASTER_KEY_PAIR_PATH,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  TOKEN_DECIMALS,
  TOKEN_SUPPLY,
  INSTALL_PAYMENT_AMOUNT,
} = process.env;

const KEYS = Keys.Secp256K1.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`
);

let recipientAccountHash =
  "account-hash-fa12d2dd5547714f8c2754d418aa8c9d59dc88780350cb4254d622e2d4ef7e69";

const minter = KEYS.publicKey.toAccountHashStr();
console.log("my account has", minter);

function toToken(n: string, decimals: string) {
  return new BigNumber(n.toString())
    .dividedBy(new BigNumber(10).pow(new BigNumber(decimals.toString())))
    .toString();
}

function toContractUnit(n: string, decimals: string) {
  return new BigNumber(n.toString())
    .multipliedBy(new BigNumber(10).pow(new BigNumber(decimals.toString())))
    .toFixed(0);
}

const test = async () => {
  const erc20 = new ERC20Client(
    NODE_ADDRESS!,
    CHAIN_NAME!,
    EVENT_STREAM_ADDRESS!
  );

  const client = new CasperServiceByJsonRPC(NODE_ADDRESS!);

  await erc20.setContractHash(
    "hash-70ef507ab53f933f802ff95ca6fca441967fde634d99eec6c6991730c504214b".slice(
      5
    )
  );
  let recipientAccountHashByte = Uint8Array.from(
    Buffer.from(recipientAccountHash.slice(13), "hex")
  );

  const name = await erc20.name();
  console.log(`... Contract name: ${name}`);

  const symbol = await erc20.symbol();
  console.log(`... Contract symbol: ${symbol}`);

  let decimals = await erc20.decimals();
  console.log(`... Decimals: ${decimals}`);

  let totalSupply = await erc20.totalSupply();
  console.log(`... Total supply: ${toToken(totalSupply, decimals)}`);

  // try {
  //   const balance = await erc20.balanceOf(
  //     new CLAccountHash(recipientAccountHashByte),
  //   )
  //   console.log(
  //     `Balance of ${recipientAccountHash}: ${toToken(balance, decimals)}`,
  //   )
  // } catch (e) {
  //   console.log('errorrrr', e)
  // }

  // const balance1 = await erc20.balanceOf(
  //   new CLAccountHash(recipientAccountHashByte),
  // )
  // console.log(`Balance of ${recipientAccountHash}: ${balance1}`)
  try {
    console.log("redaing");
    const deploy = await client.getDeployInfo("0xe9eac065dc9f8835c3426bc23d249ffb1b5a68db4eed76385aa1dab773bff451");
    console.log("deploy", deploy);
  } catch (e) {
    console.log("e", e);
  }
  //transfer
  {
    // const deployHash = await erc20.transfer(KEYS, new CLAccountHash(recipientAccountHashByte), '100', '2000000000')
    // getDeploy(NODE_ADDRESS!, deployHash)
  }

  //mint
  {
    // let deployHash = await erc20.mint(KEYS, new CLAccountHash(recipientAccountHashByte), '10000', 'mint1', '2000000000')
    // await getDeploy(NODE_ADDRESS!, deployHash)
    // deployHash = await erc20.mint(KEYS, new CLAccountHash(recipientAccountHashByte), '10000', 'mint2', '2000000000')
    // await getDeploy(NODE_ADDRESS!, deployHash)
  }
  // const userKeyPairSet = getKeyPairOfUserSet(PATH_TO_USERS!)

  // let deployHashes: string[] = []

  // for (const userKeyPair of userKeyPairSet) {
  //   const deployHash = await erc20.transfer(
  //     KEYS,
  //     userKeyPair.publicKey,
  //     '2000000000',
  //     '10000000000000',
  //   )
  //   console.log(
  //     `Transfer from ${KEYS.publicKey.toHex()} to ${userKeyPair.publicKey.toHex()}`,
  //   )
  //   console.log(`... Deploy Hash: ${deployHash}`)
  //   deployHashes = [...deployHashes, deployHash]
  // }

  // await Promise.all(deployHashes.map((hash) => getDeploy(NODE_ADDRESS!, hash)))
  // console.log('All deploys succeded')
  // deployHashes = []

  // for (const userKeyPair of userKeyPairSet) {
  //   const balance = await erc20.balanceOf(userKeyPair.publicKey)
  //   console.log(`Balance of ${userKeyPair.publicKey.toHex()}: ${balance}`)
  // }

  // const balance = await erc20.balanceOf(KEYS.publicKey)
  // console.log(`Balance of master account: ${balance}`)

  // console.log(`Setup user transfers approve`)

  // for (const userKeyPair of userKeyPairSet) {
  //   const deployHash = await erc20.approve(
  //     KEYS,
  //     userKeyPair.publicKey,
  //     '1000000000',
  //     '10000000000000',
  //   )
  //   console.log(`Approve for ${userKeyPair.publicKey.toHex()}`)
  //   console.log(`... Deploy Hash: ${deployHash}`)
  //   deployHashes = [...deployHashes, deployHash]
  // }

  // await Promise.all(deployHashes.map((hash) => getDeploy(NODE_ADDRESS!, hash)))
  // console.log('All deploys succeded')
  // deployHashes = []

  // for (const userKeyPair of userKeyPairSet) {
  //   const allowance = await erc20.allowances(
  //     KEYS.publicKey,
  //     userKeyPair.publicKey,
  //   )
  //   console.log(`Allowance of ${userKeyPair.publicKey.toHex()}: ${allowance}`)
  // }

  // console.log(`Run transfers from main account`)
  // for (const userKeyPair of userKeyPairSet) {
  //   const deployHash = await erc20.transferFrom(
  //     userKeyPair,
  //     KEYS.publicKey,
  //     userKeyPair.publicKey,
  //     '100000',
  //     '10000000000000',
  //   )
  //   console.log(
  //     `Transfer from ${KEYS.publicKey.toHex()} to ${userKeyPair.publicKey.toHex()}`,
  //   )
  //   console.log(`... Deploy Hash: ${deployHash}`)
  //   deployHashes = [...deployHashes, deployHash]
  // }

  // await Promise.all(deployHashes.map((hash) => getDeploy(NODE_ADDRESS!, hash)))
  // console.log('All deploys succeded')
  // deployHashes = []
  console.log("done");
};

test();
