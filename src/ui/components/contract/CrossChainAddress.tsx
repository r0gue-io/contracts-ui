import { useEffect, useState } from 'react';
import { blake2AsU8a, decodeAddress, encodeAddress } from '@polkadot/util-crypto';
import { TypeRegistry } from '@polkadot/types';
import { u8aToHex } from '@polkadot/util';
import { CopyButton } from 'ui/components/common/CopyButton';

interface ChainAddressCalculatorProps {
  address: string;
}

export const CrossChainAddress: React.FC<ChainAddressCalculatorProps> = ({ address }) => {
  const [result, setResult] = useState<{
    relayByte: string;
    relayAddress: string;
    assetHubByte: string;
    assetHubAddress: string;
  }>({
    relayByte: '',
    relayAddress: '',
    assetHubByte: '',
    assetHubAddress: '',
  });

  const calculateAddress = async () => {
    const accType = 'AccountId32';
    const decodedAddress = decodeAddress(address);

    const registry = new TypeRegistry();
    const toHash = (family: string, paraId: number | undefined) => {
      return new Uint8Array([
        ...new TextEncoder().encode(family),
        ...(paraId ? registry.createType('Compact<u32>', paraId).toU8a() : []),
        ...registry.createType('Compact<u32>', accType.length + 32).toU8a(),
        ...new TextEncoder().encode(accType),
        ...decodedAddress,
      ]);
    };

    const asset_hub_chain = toHash('SiblingChain', 4001);
    const relay_chain = toHash('ChildChain', 4001);

    const SiblingDescendOriginAddress32 = u8aToHex(blake2AsU8a(asset_hub_chain).slice(0, 32));
    const RelayDescendOriginAddress32 = u8aToHex(blake2AsU8a(relay_chain).slice(0, 32));
    const SiblingSs58Address = encodeAddress(SiblingDescendOriginAddress32, 0);
    const RelaySs58Address = encodeAddress(RelayDescendOriginAddress32, 0);

    setResult({
      relayByte: RelayDescendOriginAddress32,
      relayAddress: RelaySs58Address,
      assetHubByte: SiblingDescendOriginAddress32,
      assetHubAddress: SiblingSs58Address,
    });
  };

  useEffect(() => {
    calculateAddress();
  }, [address]);

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center">
        <div className="w-48">Relay Public Address:</div>
        <span
          className="text-md ml-2 inline-flex min-w-[min-content] items-center whitespace-nowrap rounded bg-blue-500 bg-opacity-20 px-1.5 py-1 font-mono text-blue-400"
          title={result.relayByte}
        >
          {result.relayByte}
        </span>
        <CopyButton className="ml-1" id="relay-byte-address" value={result.relayByte} />
      </div>

      <div className="flex items-center">
        <div className="w-48">Relay Address:</div>
        <span
          className="text-md ml-2 inline-flex min-w-[min-content] items-center whitespace-nowrap rounded bg-blue-500 bg-opacity-20 px-1.5 py-1 font-mono text-blue-400"
          title={result.relayAddress}
        >
          {result.relayAddress}
        </span>
        <CopyButton className="ml-1" id="relay-address" value={result.relayAddress} />
      </div>

      <div className="flex items-center">
        <div className="w-48">Asset Hub Public Address:</div>
        <span
          className="text-md ml-2 inline-flex min-w-[min-content] items-center whitespace-nowrap rounded bg-blue-500 bg-opacity-20 px-1.5 py-1 font-mono text-blue-400"
          title={result.assetHubByte}
        >
          {result.assetHubByte}
        </span>
        <CopyButton className="ml-1" id="asset-hub-byte-address" value={result.assetHubByte} />
      </div>

      <div className="flex items-center">
        <div className="w-48">Asset Hub Address:</div>
        <span
          className="text-md ml-2 inline-flex min-w-[min-content] items-center whitespace-nowrap rounded bg-blue-500 bg-opacity-20 px-1.5 py-1 font-mono text-blue-400"
          title={result.assetHubAddress}
        >
          {result.assetHubAddress}
        </span>
        <CopyButton className="ml-1" id="asset-hub-address" value={result.assetHubAddress} />
      </div>
    </div>
  );
};
