import {
  COMPOUND_WETH_ADDRESS,
  COMPOUND_USDT_ADDRESS,
  COMPOUND_WETH_ABI,
  COMPOUND_USDC_ADDRESS,
  COMPOUND_USDC_ABI,
  COMPOUND_USDT_ABI,
  COMPOUND_USDT_SUPPLY_TOKEN,
  COMPOUND_USDC_SUPPLY_TOKEN,
  COMPOUND_WETH_SUPPLY_TOKEN,
} from '@/features/superChain/constants'
import { Eip1193Provider } from 'ethers'
import { type Address, encodeFunctionData } from 'viem'

import { Safe4337Pack } from '@safe-global/relay-kit'
import { BACKEND_BASE_URI } from '@/config/constants'
import { ConnectedWallet } from '../wallets/useOnboard'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'

let fetchPatched = false

function useCompound() {
  const getCompoundWETHDepositCallable = () => {
    return getDepositOnCompoundCallable(COMPOUND_WETH_ADDRESS, COMPOUND_WETH_ABI, COMPOUND_WETH_SUPPLY_TOKEN)
  }

  const getCompoundUSDCDepositCallable = () => {
    return getDepositOnCompoundCallable(COMPOUND_USDC_ADDRESS, COMPOUND_USDC_ABI, COMPOUND_USDC_SUPPLY_TOKEN)
  }

  const getCompoundUSDTDepositCallable = () => {
    return getDepositOnCompoundCallable(COMPOUND_USDT_ADDRESS, COMPOUND_USDT_ABI, COMPOUND_USDT_SUPPLY_TOKEN)
  }

  const getDepositOnCompoundCallable = (contract: Address, abi: any, supplyToken: Address) => {
    return {
      callContract: async (wallet: ConnectedWallet, safeAddres: string, amount: string) => {
        //TODO Check fetchpactching
        if (!fetchPatched) {
          const originalFetch = window.fetch

          window.fetch = (url, options = {}) => {
            return originalFetch(url, {
              ...options,
              credentials: 'include',
            })
          }

          fetchPatched = true
        }

        const safe4337Pack = await Safe4337Pack.init({
          provider: wallet.provider as Eip1193Provider,
          signer: wallet.address,
          bundlerUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
          paymasterOptions: {
            isSponsored: true,
            paymasterUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
          },
          options: {
            safeAddress: safeAddres,
          },
          onchainAnalytics: {
            platform: 'Web',
            project: 'SuperAccounts',
          },
          safeModulesVersion: '0.3.0',
        })

        const txApproveBaseData = encodeFunctionData({
          abi: abi,
          functionName: 'approve',
          args: [safeAddres as Address, amount],
        })
        const txApproveData = `0x${txApproveBaseData}`

        const approveTx: MetaTransactionData = {
          to: contract,
          value: '0',
          data: txApproveData,
        }

        const txSupplyBaseData = encodeFunctionData({
          abi: abi,
          functionName: 'supply',
          args: [supplyToken, amount],
        })
        const txSupplyData = `0x${txSupplyBaseData}`

        const supplyTx: MetaTransactionData = {
          to: contract,
          value: '0',
          data: txSupplyData,
        }

        const identifiedSafeOperation = await safe4337Pack.createTransaction({
          transactions: [approveTx, supplyTx],
        })

        const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
        const userOperationHash = await safe4337Pack.executeTransaction({
          executable: signedSafeOperation,
        })

        return userOperationHash
      },
    }
  }

  const getCompoundWETHWithdrawCallable = () => {
    return getWithdrawOnCompoundCallable(COMPOUND_WETH_ADDRESS, COMPOUND_WETH_ABI, COMPOUND_WETH_SUPPLY_TOKEN)
  }

  const getCompoundUSDCWithdrawCallable = () => {
    return getWithdrawOnCompoundCallable(COMPOUND_USDC_ADDRESS, COMPOUND_USDC_ABI, COMPOUND_USDC_SUPPLY_TOKEN)
  }

  const getCompoundUSDTWithdrawCallable = () => {
    return getWithdrawOnCompoundCallable(COMPOUND_USDT_ADDRESS, COMPOUND_USDT_ABI, COMPOUND_USDT_SUPPLY_TOKEN)
  }

  const getWithdrawOnCompoundCallable = (contract: Address, abi: any, supplyToken: Address) => {
    return {
      callContract: async (wallet: ConnectedWallet, safeAddres: string, amount: string) => {
        //TODO Check fetchpactching
        if (!fetchPatched) {
          const originalFetch = window.fetch

          window.fetch = (url, options = {}) => {
            return originalFetch(url, {
              ...options,
              credentials: 'include',
            })
          }

          fetchPatched = true
        }

        const safe4337Pack = await Safe4337Pack.init({
          provider: wallet.provider as Eip1193Provider,
          signer: wallet.address,
          bundlerUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
          paymasterOptions: {
            isSponsored: true,
            paymasterUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
          },
          options: {
            safeAddress: safeAddres,
          },
          onchainAnalytics: {
            platform: 'Web',
            project: 'SuperAccounts',
          },
          safeModulesVersion: '0.3.0',
        })

        const txWithdrawBaseData = encodeFunctionData({
          abi: abi,
          functionName: 'withdraw',
          args: [safeAddres as Address, 'certificateID'], //toodo
        })
        const txWithdrawData = `0x${txWithdrawBaseData}`

        const withdrawTx: MetaTransactionData = {
          to: contract,
          value: '0',
          data: txWithdrawData,
        }

        const identifiedSafeOperation = await safe4337Pack.createTransaction({
          transactions: [withdrawTx],
        })

        const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
        const userOperationHash = await safe4337Pack.executeTransaction({
          executable: signedSafeOperation,
        })

        return userOperationHash
      },
    }
  }
}

export default useCompound
