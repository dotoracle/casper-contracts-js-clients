import { config } from 'dotenv'
config({ path: './.env.erc20' })

import { ERC20Client } from 'casper-erc20-js-client'
import { utils } from 'casper-js-client-helper'
import { sleep, getDeploy } from '../utils'

import {
  CLValueBuilder,
  Keys,
  CLPublicKey,
  CLPublicKeyType,
} from 'casper-js-sdk'

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
} = process.env

const KEYS = Keys.Secp256K1.parseKeyFiles(
  `${MASTER_KEY_PAIR_PATH}/public_key.pem`,
  `${MASTER_KEY_PAIR_PATH}/secret_key.pem`,
)

const minter = KEYS.publicKey.toAccountHashStr()
const swap_fee = '0'
const dev = minter
const origin_chainid = '1'
const origin_contract_address = 'origin contract address'

const test = async () => {
  const erc20 = new ERC20Client(
    NODE_ADDRESS!,
    CHAIN_NAME!,
    EVENT_STREAM_ADDRESS!,
  )

  const installDeployHash = await erc20.install(
    KEYS,
    TOKEN_NAME!,
    TOKEN_SYMBOL!,
    TOKEN_DECIMALS!,
    TOKEN_SUPPLY!,
    minter,
    swap_fee,
    dev,
    origin_chainid,
    origin_contract_address,
    INSTALL_PAYMENT_AMOUNT!,
    WASM_PATH!,
  )

  console.log(`... Contract installation deployHash: ${installDeployHash}`)

  await getDeploy(NODE_ADDRESS!, installDeployHash)

  console.log(`... Contract installed successfully.`)

  let accountInfo = await utils.getAccountInfo(NODE_ADDRESS!, KEYS.publicKey)

  console.log(`... Account Info: `)
  console.log(JSON.stringify(accountInfo, null, 2))

  const contractHash = await utils.getAccountNamedKeyValue(
    accountInfo,
    `erc20_token_contract`,
  )

  console.log(`... Contract Hash: ${contractHash}`)
}

test()
