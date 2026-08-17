import { isError } from 'ethers';
import type { AbiCodec, DecodedError, Hex } from './types.js';

function isHexData(value: unknown): value is Hex {
    return typeof value === 'string'
        && /^0x(?:[0-9a-fA-F]{2})*$/.test(value);
}

export function extractEthersRevertData(error: unknown): Hex | undefined {
    if (!isError(error, 'CALL_EXCEPTION')) return undefined;
    return isHexData(error.data) ? error.data : undefined;
}

export function decodeEthersError(
    error: unknown,
    codec: AbiCodec,
): DecodedError | undefined {
    const data = extractEthersRevertData(error);
    return data === undefined ? undefined : codec.decodeError(data);
}
