import { Eip1193Provider, MaxUint256, parseUnits } from 'ethers'
import { type Address, encodeFunctionData, erc20Abi } from 'viem'
import { Safe4337Pack } from '@safe-global/relay-kit'
import { BACKEND_BASE_URI } from '@/config/constants'
import { ConnectedWallet } from '../wallets/useOnboard'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import useWallet from '../wallets/useWallet'
import useSafeAddress from '../useSafeAddress'
import {
  COMPOUND_ABI,
  COMPOUND_WETH_SUPPLY_TOKEN,
  COMPOUND_USDC_SUPPLY_TOKEN,
  COMPOUND_USDT_SUPPLY_TOKEN,
} from '@/features/superChain/constants'
import { fetchPatched } from '../super-chain/useSuperChainAccount'
import { patchFetch } from '@/services/airdrop/fecthPatch'

function useCompound() {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()

  const TOKEN_DECIMALS: Record<Address, number> = {
    [COMPOUND_WETH_SUPPLY_TOKEN]: 18,
    [COMPOUND_USDC_SUPPLY_TOKEN]: 6,
    [COMPOUND_USDT_SUPPLY_TOKEN]: 6,
  } as const

  const getCompoundDepositCallable = (contract: Address, supplyToken: Address) => {
    return getDepositOnCompoundCallable(contract, supplyToken)
  }

  const getCompoundWithdrawCallable = (contract: Address, supplyToken: Address) => {
    return getWithdrawOnCompoundCallable(contract, supplyToken)
  }

  const getDepositOnCompoundCallable = (supplyToken: Address, contract: Address) => {
    return {
      callContract: async (amount: string) => {
        patchFetch()

        const safe4337Pack = await Safe4337Pack.init({
          provider: wallet?.provider as Eip1193Provider,
          signer: wallet?.address,
          bundlerUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
          paymasterOptions: {
            isSponsored: true,
            paymasterUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
          },
          options: {
            safeAddress: safeAddress,
          },
          onchainAnalytics: {
            platform: 'Web',
            project: 'SuperAccounts',
          },
          safeModulesVersion: '0.3.0',
        })

        const bigIntAmount = parseUnits(amount, 6)

        const approveTx: MetaTransactionData = {
          to: supplyToken,
          value: '0',
          data: encodeFunctionData({
            abi: COMPOUND_ABI,
            functionName: 'approve',
            args: [contract as Address, MaxUint256],
          }),
        }

        const supplyTx: MetaTransactionData = {
          to: contract,
          value: '0',
          data: encodeFunctionData({
            abi: COMPOUND_ABI,
            functionName: 'supply',
            args: [supplyToken, bigIntAmount],
          }),
        }

        console.log('approve: ', approveTx)
        console.log('supplyTx', supplyTx)
        console.log('Creating tx... ')

        const identifiedSafeOperation = await safe4337Pack.createTransaction({
          transactions: [approveTx, supplyTx],
        })

        const signedSafeOperation = await safe4337Pack.signSafeOperation(identifiedSafeOperation)
        const userOperationHash = await safe4337Pack.executeTransaction({
          executable: signedSafeOperation,
        })

        console.log('Allowed... ')
        // const operation = await safe4337Pack.createTransaction({
        //   transactions: [supplyTx],
        // })

        // const signedOperation = await safe4337Pack.signSafeOperation(operation)
        // const operationHash = await safe4337Pack.executeTransaction({
        //   executable: signedOperation,
        // })
        // console.log('Finished... ')
        return userOperationHash
      },
    }
  }

  const getWithdrawOnCompoundCallable = (contract: Address, supplyToken: Address) => {
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

        const bigIntAmount = parseUnits(amount, TOKEN_DECIMALS[supplyToken])

        const txWithdrawBaseData = encodeFunctionData({
          abi: COMPOUND_ABI,
          functionName: 'withdraw',
          args: [safeAddres as Address, 'certificateID'], //TODO
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

  return {
    getCompoundDepositCallable,
    getCompoundWithdrawCallable,
  }
}

export default useCompound
