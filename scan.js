require('dotenv').config({ path: './.env.erc20' })

const CasperServiceByJsonRPC = require('casper-js-sdk').CasperServiceByJsonRPC

const BigNumber = require('bignumber.js')

const configInfo = require('config')

const { NODE_ADDRESS, EVENT_STREAM_ADDRESS, CHAIN_NAME } = process.env

function toToken(n, decimals) {
  return new BigNumber(n.toString())
    .dividedBy(new BigNumber(10).pow(new BigNumber(decimals.toString())))
    .toString()
}

function toContractUnit(n, decimals) {
  return new BigNumber(n.toString())
    .multipliedBy(new BigNumber(10).pow(new BigNumber(decimals.toString())))
    .toFixed(0)
}

function findArg(args, argName) {
  return args.find((e) => e[0] == argName)
}

const test = async () => {
  const client = new CasperServiceByJsonRPC(NODE_ADDRESS)
  let fromBlock = parseInt(configInfo[configInfo.network].fromBlock)
  let contractHashes = configInfo[configInfo.network].contractHashes
  let currentBlock = await client.getLatestBlockInfo()
  let currentBlockHeight = parseInt(currentBlock.block.header.height.toString())
  while (currentBlockHeight - fromBlock > 15) {
    //reading info
    let block = await client.getBlockInfoByHeight(fromBlock)

    let deploy_hashes = block.block.body.deploy_hashes

    //reading deploy hashes one by one
    for (const h of deploy_hashes) {
      let deployResult = await client.getDeployInfo(h)
      let deploy = deployResult.deploy
      if (deployResult.execution_results) {
        let result = deployResult.execution_results[0]
        if (result.result.Success) {
          //analyzing deploy details
          let session = deploy.session
          if (session && session.StoredContractByHash) {
            let StoredContractByHash = session.StoredContractByHash
            if (contractHashes.includes(StoredContractByHash.hash)) {
              let args = StoredContractByHash.args
              if (StoredContractByHash.entry_point == 'mint') {
                let recipient = findArg(args, 'recipient')
                let amount = findArg(args, 'amount')
                let mintid = findArg(args, 'mintid')
                let fee = findArg(args, 'swap_fee')

                console.log('recipient', recipient[1].parsed['Account'])
                console.log('amount', amount[1].parsed)
                console.log('mintid', mintid[1].parsed)
                console.log('fee', fee[1].parsed)

                //saving to db
              } else if (StoredContractByHash.entry_point == 'transfer') {
                console.log('transfer')
              } else if (
                StoredContractByHash.entry_point == 'request_bridge_back'
              ) {
                console.log('request_bridge_back')
              }
            }
          }
        }
      }
    }
    fromBlock++
  }
}

test()
