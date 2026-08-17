import {
    Interface,
    type EventFragment,
    type InterfaceAbi,
} from 'ethers';
import type { AbiCodec, DecodedError, DecodedEvent, Hex } from './types.js';

const STANDARD_ERRORS = [
    'error Error(string)',
    'error Panic(uint256)',
] as const;

function eventKey(
    name: string,
    index: number,
    used: Set<string>,
): string {
    if (name && !used.has(name)) {
        used.add(name);
        return name;
    }

    return String(index);
}

function normalizeEvent(
    fragment: EventFragment,
    result: readonly unknown[],
): DecodedEvent {
    const values: Record<string, unknown> = {};
    const used = new Set<string>();

    for (let index = 0; index < fragment.inputs.length; index += 1) {
        const input = fragment.inputs[index];
        const key = eventKey(input.name, index, used);
        values[key] = result[index];
    }

    return values;
}

export function createEthersAbiCodec(abi: InterfaceAbi): AbiCodec {
    const iface = new Interface([
        ...abi,
        ...STANDARD_ERRORS,
    ]);

    return {
        encode(signature, args = []) {
            return iface.encodeFunctionData(signature, [...args]) as Hex;
        },

        decode(signature, data) {
            const decoded = iface.decodeFunctionResult(signature, data);
            return [...decoded] as readonly unknown[];
        },

        decodeEvent(signature, topics, data) {
            const fragment = iface.getEvent(signature);
            if (!fragment) {
                throw new Error(`Unknown event signature: ${signature}`);
            }

            const decoded = iface.decodeEventLog(
                fragment,
                data,
                [...topics],
            );

            return normalizeEvent(fragment, [...decoded] as readonly unknown[]);
        },

        decodeError(data): DecodedError | undefined {
            try {
                const parsed = iface.parseError(data);
                if (!parsed) return undefined;

                return {
                    name: parsed.name,
                    args: [...parsed.args],
                };
            } catch {
                return undefined;
            }
        },
    };
}
