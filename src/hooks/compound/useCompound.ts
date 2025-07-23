import { Eip1193Provider, MaxUint256 } from 'ethers'
import { type Address, encodeFunctionData, parseUnits } from 'viem'
import { Safe4337Pack } from '@safe-global/relay-kit'
import { BACKEND_BASE_URI } from '@/config/constants'
import { MetaTransactionData } from '@safe-global/safe-core-sdk-types'
import useWallet from '../wallets/useWallet'
import useSafeAddress from '../useSafeAddress'
import { COMPOUND_ABI } from '@/features/superChain/constants'
import { patchFetch } from '@/utils/fecthPatch'

const usd_tokens = ['0x94b008aa00579c1307b0ef2c499ad98a8ce58e58', '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85']

function useCompound() {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()

  const getCompoundDepositCallable = (contract: Address, supplyToken: Address) => {
    return getDepositOnCompoundCallable(contract, supplyToken)
  }

  const getCompoundWithdrawCallable = (contract: Address, supplyToken: Address) => {
    return getWithdrawOnCompoundCallable(contract, supplyToken)
  }

  const initializeSafeKit = async (): Promise<Safe4337Pack> => {
    patchFetch()
    return await Safe4337Pack.init({
      provider: wallet?.provider as Eip1193Provider,
      signer: wallet?.address,
      bundlerUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
      paymasterOptions: {
        isSponsored: true,
        paymasterUrl: `${BACKEND_BASE_URI}/user-op-reverse-proxy`,
      },
      options: {
        safeAddress,
      },
      onchainAnalytics: {
        platform: 'Web',
        project: 'SuperAccounts',
      },
      safeModulesVersion: '0.3.0',
    })
  }

  const truncateDecimals = (value: string, decimals: number) => {
    const [intPart, decPart = ''] = value.split('.')
    const truncatedDec = decPart.slice(0, decimals)
    return decPart.length ? `${intPart}.${truncatedDec}` : intPart
  }
  const getDepositOnCompoundCallable = (supplyToken: Address, contract: Address) => {
    return {
      callContract: async (depositAmount: string) => {
        patchFetch()
        const decimals = usd_tokens.includes(supplyToken) ? 6 : 18
        const amount = truncateDecimals(depositAmount, decimals)
        //TODO improve
        const bigIntAmount = parseUnits(amount, decimals)
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

        const safe4337Pack = await initializeSafeKit()

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

  const getWithdrawOnCompoundCallable = (supplyToken: Address, contract: Address) => {
    return {
      callContract: async (withDrawAmount: string) => {
        patchFetch()

        const safe4337Pack = await initializeSafeKit()

        const decimals = usd_tokens.includes(supplyToken) ? 6 : 18
        const amount = truncateDecimals(withDrawAmount, decimals)

        const bigIntAmount = parseUnits(amount, decimals)

        const withdrawTx: MetaTransactionData = {
          to: contract,
          value: '0',
          data: encodeFunctionData({
            abi: COMPOUND_ABI,
            functionName: 'withdraw',
            args: [supplyToken as Address, bigIntAmount],
          }),
        }
        console.log(withdrawTx)
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
