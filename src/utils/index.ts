import dayjs from 'dayjs'
import { removeConfigLayout } from '@/utils/cache/local-storage'

import { useUserStore } from '@/store/modules/user'

import { ethers } from 'ethers'

import api from '@/utils/api'

import numeral from 'numeral'

import { Decimal } from 'decimal.js'

import moment from 'moment-timezone'

import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from 'element-plus'

/** 格式化时间 */
export const formatDateTime = (time: string | number | Date) => {
  return time ? dayjs(new Date(time)).format('YYYY-MM-DD HH:mm:ss') : 'N/A'
}

/** 用 JS 获取全局 css 变量 */
export const getCssVariableValue = (cssVariableName: string) => {
  let cssVariableValue = ''
  try {
    // 没有拿到值时，会返回空串
    cssVariableValue = getComputedStyle(document.documentElement).getPropertyValue(cssVariableName)
  } catch (error) {
    console.error(error)
  }
  return cssVariableValue
}

/** 用 JS 设置全局 CSS 变量 */
export const setCssVariableValue = (cssVariableName: string, cssVariableValue: string) => {
  try {
    document.documentElement.style.setProperty(cssVariableName, cssVariableValue)
  } catch (error) {
    console.error(error)
  }
}

/** 重置项目配置 */
export const resetConfigLayout = () => {
  removeConfigLayout()
  location.reload()
}

async function checkChainId(chainId) {
  try {
    console.info(chainId)
    // @ts-ignore
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x' + parseInt(chainId).toString(16) }],
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

export async function buildContract(blockchainId, smartContractCode) {
  const user = useUserStore()

  const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

  if (accounts[0].toLowerCase() !== user.walletAddress.toLowerCase()) {
    throw new Error('Sorry, the current use wallet and login wallet do not match')
  }

  const blockchain = await getBlockchain(blockchainId)

  console.info(blockchain)

  const currChainId = await ethereum.request({ method: 'eth_chainId' })

  // @ts-ignore
  if (parseInt(currChainId, 16) !== blockchain.chainId) {
    // example of switching or adding network with Harmony Mainnet
    const switchNetwork = async () => {
      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + parseInt(blockchain.chainId).toString(16) }],
        })
      } catch (switchError) {
        // 4902 error code indicates the chain is missing on the wallet
        if (switchError.code === 4902) {
          try {
            await ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x' + parseInt(blockchain.chainId).toString(16),
                  chainName: blockchain.name,
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: [blockchain.publicRpcUrl],
                  blockExplorerUrls: [blockchain.blockBrowserUrl],
                },
              ],
            })
          } catch (error) {
            console.error(error)
          }
        }
      }
    }

    await switchNetwork()
  }

  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  const smartContract = await getSmartContractByCode(smartContractCode, blockchainId)

  const contract = new ethers.Contract(smartContract.address, smartContract.contractBinary, signer)
  console.info(contract)
  return contract
}

async function getBlockchain(id) {
  const { result } = await api.get('/mgn/blockchain/queryById', { id })

  return result
}

async function getSmartContractByCode(code, blockchainId) {
  const { result } = await api.get('/mgn/smartContract/getSmartContractByCode', { code, blockchainId })

  return result
}

export async function handleAuthorized(blockchainId, address, amount) {
  const provider = new ethers.BrowserProvider(window.ethereum)

  const signer = await provider.getSigner()

  const MGN_token = await buildContract(blockchainId, 'Hyperdust_Token')

  const allowance = await MGN_token.allowance(signer.getAddress(), address)

  if (allowance >= ethers.parseEther('100')) {
    return
  }

  await (await MGN_token.approve(address, ethers.parseEther('9999999999'))).wait()
}

export function toAmount(amount) {
  return toCustomizeAmount(amount, 2)
}

export function toAccountAmount(amount) {
  return toCustomizeAmount(amount, 10)
}

export function toCustomizeAmount(amount, num) {
  if (!amount) {
    return '0.00'
  }

  let formatString = '0,0.' + '0'.repeat(num)
  let str = numeral(amount).format(formatString)

  // 如果小数部分为0，最多保留2位小数
  let floatNum = parseFloat(str.replace(/,/g, ''))
  str = floatNum.toString()

  // 如果小数末尾部分为0，去掉0
  str = str.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1')

  // 如果小数部分只有一位，补充一位0
  if (str.indexOf('.') !== -1 && str.split('.')[1].length < 2) {
    str += '0'
  }

  // 如果没有小数部分，则补充为两位小数
  if (str.indexOf('.') === -1) {
    str += '.00'
  }

  return str
}

export function toLocalTime(dateStr) {
  let beijingTime = moment.tz(dateStr, 'Asia/Shanghai')
  let localTime = beijingTime.clone().tz(moment.tz.guess())

  let localTimeString = localTime.format('YYYY-MM-DD HH:mm:ss')

  return localTimeString
}

export function toServerTime(dateStr) {
  let beijingTime = moment.tz(dateStr, moment.tz.guess())
  let localTime = beijingTime.clone().tz('Asia/Shanghai')

  let localTimeString = localTime.format('YYYY-MM-DD HH:mm:ss')

  return localTimeString
}

export function exceptionHandling(e, t) {
  console.error('Error details:', e) // 输出完整的错误详情

  if (!e.code) {
    // 检查网络相关的错误
    if (e.message.includes('Failed to fetch') || e.message.includes('Network Error')) {
      ElMessage.error(t('errors.networkError'))
      return
    }
  }

  const error = e.info.error
  // RPC错误处理
  if (error.code && error.code === 4001) {
    // 用户拒绝了交易请求
    ElMessage.error(t('errors.transactionRejectedByUser'))
  } else if (error.code && error.code === -32000) {
    // 服务器拒绝了请求，可能是因为gas价格太低
    ElMessage.error(t('errors.serverRejectedRequest'))
  } else if (e.reason) {
    // 合约抛出的错误
    ElMessage.error(t('errors.contractError', { reason: e.reason }))
  } else {
    // 其他类型的错误
    ElMessage.error(e.message || t('errors.unknownError'))
  }
}
