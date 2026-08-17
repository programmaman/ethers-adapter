# @rakelabs/ethers-adapter

Ethers transport and ABI adapter for the Rakelabs SDK packages.

```ts
import { BrowserProvider } from 'ethers';
import { ABI, Disputes } from '@rakelabs/disputes-sdk';
import {
  createEthersAbiCodec,
  createEthersRpcClient,
} from '@rakelabs/ethers-adapter';

const provider = new BrowserProvider(window.ethereum);
const rpcClient = createEthersRpcClient(provider);
const codec = createEthersAbiCodec(ABI);

const disputes = await Disputes.fromRpc(rpcClient, {
  codec,
  walletAddress,
});
```

This package does not contain protocol ABIs and does not sign or submit transactions.
