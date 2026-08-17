import type { AbstractProvider } from 'ethers';
import type {
    BlockInfo,
    CallRequest,
    EvmLog,
    LogFilter,
    ReadBlockReference,
    RpcClient,
} from './types.js';
import type { Hex } from './types.js';

export type EthersProvider = Pick<
    AbstractProvider,
    'call' | 'getLogs' | 'getNetwork' | 'getBlock'
>;

export function createEthersRpcClient(provider: EthersProvider): RpcClient {
    return {
        async call(request) {
            return await provider.call({
                to: request.to,
                data: request.data,
                ...(request.from === undefined ? {} : { from: request.from }),
                ...(request.value === undefined ? {} : { value: request.value }),
                ...(request.block === undefined ? {} : { blockTag: toEthersBlockTag(request.block) }),
            }) as Hex;
        },

        async getLogs(filter) {
            const logs = await provider.getLogs({
                ...(filter.address === undefined ? {} : { address: filter.address }),
                ...(filter.topics === undefined ? {} : { topics: filter.topics }),
                ...(filter.fromBlock === undefined ? {} : { fromBlock: toEthersLogBound(filter.fromBlock) }),
                ...(filter.toBlock === undefined ? {} : { toBlock: toEthersLogBound(filter.toBlock) }),
                ...(filter.blockHash === undefined ? {} : { blockHash: filter.blockHash }),
            } as never);

            return logs.map((log): EvmLog => ({
                address: log.address,
                topics: log.topics as Hex[],
                data: log.data as Hex,
                ...(log.transactionHash == null ? {} : { transactionHash: log.transactionHash as Hex }),
                ...(log.blockNumber === undefined ? {} : { blockNumber: log.blockNumber }),
            }));
        },

        async getChainId() {
            return Number((await provider.getNetwork()).chainId);
        },

        async getBlock(reference): Promise<BlockInfo> {
            const block = await provider.getBlock(toEthersBlockTag(reference));
            if (!block) throw new Error('Block not found');
            return { number: block.number, timestamp: block.timestamp };
        },
    };
}

function toEthersBlockTag(reference: ReadBlockReference): string | number | bigint {
    if (typeof reference === 'object' && reference !== null) {
        if ('blockNumber' in reference) return reference.blockNumber;
        if (reference.requireCanonical) {
            throw new Error('Ethers adapter does not support requireCanonical block references');
        }
        return reference.blockHash;
    }
    return reference;
}

function toEthersLogBound(value: number | bigint | string): number | bigint | string {
    return typeof value === 'string' && value === 'earliest' ? 0 : value;
}
