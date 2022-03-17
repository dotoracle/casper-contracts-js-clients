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
  DeployUtil,
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

let recipientAddress = "0x00481E0dE32FecFF1C7ce3AF19cb03E01aFC0e48";

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

  await erc20.setContractHash(
    "hash-ecefa6841d5901f196bdbaa7ec83bcf123a890da31c0f4235c7f4a72b853558b".slice(
      5
    )
  );

  const name = await erc20.name();
  console.log(`... Contract name: ${name}`);

  const symbol = await erc20.symbol();
  console.log(`... Contract symbol: ${symbol}`);

  let decimals = await erc20.decimals();
  console.log(`... Decimals: ${decimals}`);

  let totalSupply = await erc20.totalSupply();
  console.log(`... Total supply: ${toToken(totalSupply, decimals)}`);

  const balance = await erc20.balanceOf(
    new CLAccountHash(KEYS.publicKey.toAccountHash())
  );
  console.log(
    `Balance of ${KEYS.publicKey.toHex()}: ${toToken(balance, decimals)}`
  );

  //transfer
  {
    // const deployHash = await erc20.transfer(KEYS, new CLAccountHash(recipientAccountHashByte), totalSupply + '100', '2000000000')
    // getDeploy(NODE_ADDRESS!, deployHash)
  }

  //request
  {
    let deploy = await erc20.createUnsignedRequestBridgeBack(
      KEYS.publicKey,
      toContractUnit("111", "18"),
      "97",
      recipientAddress,
      "2000000000"
    );

    let signedDeploy = DeployUtil.signDeploy(deploy, KEYS)
    let signature = signedDeploy.approvals[0].signature
    signature = signature.slice(2)
    let signatureBytes = Uint8Array.from(Buffer.from(signature, "hex"))
    //console.log('signature', signature)
    let info = await erc20.putSignatureAndSend({
      publicKey: KEYS.publicKey,
      deploy,
      signature: signatureBytes,
      nodeAddress: NODE_ADDRESS!
    })
    console.log("deploy sent", info[1])
    // await getDeploy(NODE_ADDRESS!, deployHash)
    //let index = await erc20.readRequestIndex("54a784711f0c1d9e50a93802be1fa9e1e45fbdfd19e9f884d74907a20842406f")
    //console.log('index', index)
  }
  console.log("done");
};

test();
