import { BACKEND_BASE_URI } from '@/config/constants'
import { CHAIN_ID, JSON_RPC_PROVIDER } from '@/features/superChain/constants'
import { createSmartAccountClient } from 'permissionless'
import { toSafeSmartAccount } from 'permissionless/accounts'
import { createPimlicoClient } from 'permissionless/clients/pimlico'
import { type Address, createPublicClient, http, WalletClient, Transport, Account, Chain } from 'viem'
import { entryPoint07Address } from 'viem/account-abstraction'
import { sepolia, optimism } from 'viem/chains'
import { prepareUserOperation as viemPrepareUserOperation } from "viem/account-abstraction"
import { ethers } from 'ethers'



const IDENTIFIER = '5afe003433613232343763663835306565386462343564646561393063346135'

function modifyPaymasterData(request: any, appendString: string): any {
  if (request.method === "eth_sendUserOperation" && Array.isArray(request.params)) {
    const modifiedRequest = { ...request };
    modifiedRequest.params = request.params.map((param: any) => {
      if (typeof param === "object" && param !== null && "signature" in param) {
        return {
          ...param,
          signature: `${param.signature}${appendString}`
        };
      }
      return param;
    });

    return modifiedRequest;
  }
  return request;
}



const pimlicoTransport = () => {
  return http(`${BACKEND_BASE_URI}/user-op-reverse-proxy`, {
    onFetchRequest(request, init) {
      if (init?.body) {
        try {

          let requestBody = JSON.parse(init.body as string);

          requestBody = modifyPaymasterData(requestBody, IDENTIFIER)
          init.body = JSON.stringify(requestBody);

          console.log("🔹 Request modificado:", requestBody);
        } catch (error) {
          console.error("❌ Error modificando el request body:", error);
        }
      }

    },
    fetchOptions: {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    },
  })
}

export const publicClient = createPublicClient({
  transport: http(JSON_RPC_PROVIDER),
  chain: optimism,
})


export const paymasterClient = () =>
  createPimlicoClient({
    transport: pimlicoTransport(),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  })

export const pimlicoBundlerClient = () =>
  createPimlicoClient({
    transport: pimlicoTransport(),
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
  })

export async function getSmartAccountClient(
  client: WalletClient<Transport, Chain | undefined, Account>,
  safeAddress: Address,
) {
  const safeAccount = await toSafeSmartAccount({
    client: publicClient,
    entryPoint: {
      address: entryPoint07Address,
      version: '0.7',
    },
    version: '1.4.1',
    address: safeAddress,
    owners: [client],
  })
  const smartAccountClient = createSmartAccountClient({
    account: safeAccount,
    chain: CHAIN_ID === sepolia.id.toString() ? sepolia : optimism,
    bundlerTransport: pimlicoTransport(),
    paymaster: paymasterClient(),
    userOperation: {
      estimateFeesPerGas: async () => (await paymasterClient().getUserOperationGasPrice()).fast,
      prepareUserOperation: async (client, parameters_) => {

        console.log("Identifier op", parameters_);
        parameters_.calls!.forEach((element: any) => {

          const encodedData = ethers.solidityPacked(
            ['bytes', 'bytes'],
            [element.data, '0x' + IDENTIFIER]
          );
          element.data = encodedData
          console.log("Identifier op", element);
        });

        return await viemPrepareUserOperation(client, parameters_)
      }
    },
  })

  paymasterClient().getPaymasterData
  const originalSendUserOperation = smartAccountClient.sendUserOperation;
  smartAccountClient.sendUserOperation = async (userOp) => {
    console.log('OEEEEEEEEEEEEEEEEEEEEEEEEEE');
    return originalSendUserOperation(userOp);
  };

  return smartAccountClient
}
