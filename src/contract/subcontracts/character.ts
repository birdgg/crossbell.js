import { type Address } from 'viem'
import {
  type Character,
  type CharacterMetadata,
  type MintOrLinkModuleConfig,
  type Numberish,
  type ReadOverrides,
  type Result,
  type WriteOverrides,
} from '../../types'
import { ipfsParseMetadataOrUri, ipfsUriToMetadata } from '../../ipfs'
import { autoSwitchMainnet } from '../decorators'
import { getModuleConfig, parseLog, validateAddress } from '../../utils'
import { type Entry, type NewbieVilla } from '../abi'
import { type BaseContract } from './base'

export class CharacterContract {
  constructor(private base: BaseContract) {}

  /**
   * This creates a new character for an address, and returns the ID of the newly created character.
   * When the character is the first character created for an address, the address will be set as the primary character.
   * @category Character
   * @param owner - The Ethereum address of the character owner.
   * @param handle - The handle of the character you want to create.
   * @param metadataOrUri - The metadata or URI of the character.
   * @returns The transaction hash and the character ID.
   */
  @autoSwitchMainnet()
  async create(
    owner: Address,
    handle: string,
    metadataOrUri: CharacterMetadata | string,
    {
      linkModule,
    }: {
      linkModule?: MintOrLinkModuleConfig
    } = {},
    overrides: WriteOverrides<Entry, 'createCharacter'> = {},
  ): Promise<Result<bigint, true>> {
    validateAddress(owner)
    this.#validateHandleFormat(handle)

    const { uri } = await ipfsParseMetadataOrUri('character', metadataOrUri)

    const moduleConfig = await getModuleConfig(linkModule)

    const hash = await this.base.contract.write.createCharacter(
      [
        {
          to: owner,
          handle,
          uri,
          linkModule: moduleConfig.address,
          linkModuleInitData: moduleConfig.initData,
        },
      ],
      overrides,
    )

    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash,
    })

    const parser = parseLog(receipt.logs, 'CharacterCreated')

    return {
      data: parser.args.characterId,
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This changes a character's handle.
   * @category Character
   * @param characterId - The character ID of the user you want to set the handle for.
   * @param handle - The handle you want to set.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async setHandle(
    characterId: Numberish,
    handle: string,
    overrides: WriteOverrides<Entry, 'setHandle'> = {},
  ): Promise<Result<undefined, true>> {
    this.#validateHandleFormat(handle)

    const tx = await this.base.contract.write.setHandle(
      [BigInt(characterId), handle],
      overrides,
    )
    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash: tx,
    })
    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This sets a character's metadata (URI).
   * @category Character
   * @param characterId - The character ID of the user you want to set the URI for.
   * @param metadataOrUri - The metadata or URI you want to set.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async setUri(
    characterId: Numberish,
    metadataOrUri: CharacterMetadata | string,
    overrides: WriteOverrides<Entry, 'setCharacterUri'> = {},
  ): Promise<Result<{ uri: string; metadata: CharacterMetadata }, true>> {
    const { uri, metadata } = await ipfsParseMetadataOrUri(
      'character',
      metadataOrUri,
      true,
    )

    const tx = await this.base.contract.write.setCharacterUri(
      [BigInt(characterId), uri],
      overrides,
    )
    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash: tx,
    })

    return {
      data: {
        uri,
        metadata,
      },
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This is the same as {@link setUri}
   * @category Character
   */
  setMetadata(
    characterId: Numberish,
    metadata: CharacterMetadata,
    overrides: WriteOverrides<Entry, 'setCharacterUri'> = {},
  ) {
    return this.setUri(characterId, metadata, overrides)
  }

  /**
   * This changes a character's metadata (URI).
   * @category Character
   * @param characterId - The character ID of the user you want to set the URI for.
   * @param modifier - The callback function that modifies the metadata.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   * @example
   * ```js
   * // change a character's metadata name and bio
   * await contract.character.changeMetadata('42', metadata => {
   *   if (metadata !== undefined) {
   *     metadata.name = 'John Doe'
   *     metadata.bio = 'I am a person'
   *   } else {
   *     metadata = {
   *       name: 'John Doe',
   *       bio: 'I am a person',
   *     }
   *   }
   *   return metadata
   * })
   * ```
   *
   * @example
   * ```ts
   * // change a character's metadata name and bio (using spread operator)
   * await contract.character.changeMetadata('42', metadata => {
   *   metadata = {
   *     ...metadata,
   *     name: 'John Doe',
   *     bio: 'I am a person',
   *   }
   *   return metadata
   * })
   * ```
   */
  @autoSwitchMainnet()
  async changeMetadata(
    characterId: Numberish,
    modifier: (metadata?: CharacterMetadata) => CharacterMetadata,
    overrides: WriteOverrides<Entry, 'setCharacterUri'> = {},
  ) {
    const character = await this.get(characterId)

    const metadata = modifier(character.data.metadata)
    if (typeof metadata === 'undefined') {
      throw new TypeError(
        'The modified metadata is undefined. Did you return it?',
      )
    }

    if (!metadata.type) {
      metadata.type = 'character'
    }

    return this.setMetadata(characterId, metadata, overrides)
  }

  /**
   * This sets the social token for a character
   * @category Character
   * @param characterId - The character ID of the user you want to set the social token for.
   * @param socialToken - The token address you want to set for the character.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async setSocialToken(
    characterId: Numberish,
    socialToken: Address,
    overrides: WriteOverrides<Entry, 'setSocialToken'> = {},
  ): Promise<Result<undefined, true>> {
    const tx = await this.base.contract.write.setSocialToken(
      [BigInt(characterId), socialToken],
      overrides,
    )
    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash: tx,
    })
    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This sets the primary character ID for the user.
   * @category Character
   * @param characterId - The character ID of the character you want to set as primary.
   * @returns The transaction hash of the transaction that was sent to the blockchain.
   */
  @autoSwitchMainnet()
  async setPrimaryId(
    characterId: Numberish,
    overrides: WriteOverrides<Entry, 'setPrimaryCharacterId'> = {},
  ): Promise<Result<undefined, true>> {
    const hash = await this.base.contract.write.setPrimaryCharacterId(
      [BigInt(characterId)],
      overrides,
    )
    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash,
    })
    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This burns a character.
   * @category Character
   * @param characterId - The character ID of the character you want to burn.
   * @returns The transaction hash.
   */
  @autoSwitchMainnet()
  async burn(
    characterId: Numberish,
    overrides: WriteOverrides<Entry, 'burn'> = {},
  ): Promise<Result<undefined, true>> {
    const tx = await this.base.contract.write.burn(
      [BigInt(characterId)],
      overrides,
    )

    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash: tx,
    })

    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This returns the primary character ID of the given address.
   * @category Character
   * @param address - The address of the user you want to get the primary character ID for.
   * @returns The characterId of the primary character of the address.
   */
  async getPrimaryId(
    address: Address,
    overrides: ReadOverrides<Entry, 'getPrimaryCharacterId'> = {},
  ): Promise<Result<bigint>> {
    validateAddress(address)

    const characterId = await this.base.contract.read.getPrimaryCharacterId(
      [address],
      overrides,
    )

    return {
      data: characterId,
    }
  }

  /**
   * This returns a boolean indicating whether the characterId is a primary characterId of an address.
   * @category Character
   * @param characterId - The character ID of the character you want to check.
   * @returns A boolean value.
   */
  async isPrimaryId(
    characterId: Numberish,
    overrides: ReadOverrides<Entry, 'isPrimaryCharacter'> = {},
  ): Promise<Result<boolean>> {
    const isPrimary = await this.base.contract.read.isPrimaryCharacter(
      [BigInt(characterId)],
      overrides,
    )
    return {
      data: isPrimary,
    }
  }

  /**
   * This returns a character given its handle.
   * @category Character
   * @param handle - The handle of the character you want to get the content of.
   * @returns The character with the given handle.
   */
  async getByHandle(
    handle: string,
    overrides: ReadOverrides<Entry, 'getCharacterByHandle'> = {},
  ): Promise<Result<Character>> {
    handle = handle.toLowerCase()

    const character = await this.base.contract.read.getCharacterByHandle(
      [handle],
      overrides,
    )

    const metadata = character.uri
      ? await ipfsUriToMetadata<CharacterMetadata>(character.uri)
      : undefined

    return {
      data: {
        characterId: character.characterId,
        handle: character.handle,
        uri: character.uri,
        metadata,
        socialToken: character.socialToken,
        noteCount: character.noteCount,
      },
    }
  }

  /**
   * This returns a character given its characterId.
   * @category Character
   * @param characterId - The character ID of the character you want to get.
   * @returns The character with the given characterId.
   */
  async get(
    characterId: Numberish,
    overrides: ReadOverrides<Entry, 'getCharacter'> = {},
  ): Promise<Result<Character>> {
    const character = await this.base.contract.read.getCharacter(
      [BigInt(characterId)],
      overrides,
    )

    const { metadata } = await ipfsParseMetadataOrUri(
      'character',
      character.uri,
      true,
    )

    return {
      data: {
        characterId: character.characterId,
        handle: character.handle,
        uri: character.uri,
        socialToken: character.socialToken,
        noteCount: character.noteCount,
        metadata,
      },
    }
  }

  /**
   * This returns the handle of a character.
   * @category Character
   * @param characterId - The characterId of the character you want to get the handle for.
   * @returns The handle of the character.
   */
  async getHandle(
    characterId: Numberish,
    overrides: ReadOverrides<Entry, 'getHandle'> = {},
  ): Promise<Result<string>> {
    const handle = await this.base.contract.read.getHandle(
      [BigInt(characterId)],
      overrides,
    )
    return {
      data: handle,
    }
  }

  /**
   * This returns the URI of a character.
   * @category Character
   * @param characterId - The character ID of the character you want to get the URI for.
   * @returns The URI of the character.
   */
  async getUri(
    characterId: Numberish,
    overrides: ReadOverrides<Entry, 'getCharacterUri'> = {},
  ): Promise<Result<string>> {
    const uri = await this.base.contract.read.getCharacterUri(
      [BigInt(characterId)],
      overrides,
    )
    return {
      data: uri,
    }
  }

  /**
   * This returns the character given a {@link create} transaction hash.
   * @category Character
   * @param txHash - The transaction hash of the {@link create} transaction.
   * @returns The characterId of the character that was created.
   */
  async getByTransaction(
    txHash: Address,
    overrides: ReadOverrides<Entry, 'getCharacter'> = {},
  ): Promise<Result<Character>> {
    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash: txHash,
    })

    const parser = parseLog(receipt.logs, 'CharacterCreated')
    const result = await this.get(parser.args.characterId, overrides)

    return result
  }

  /**
   * This checks if a character exists.
   * @category Character
   * @param address - The address of a user.
   * @returns A boolean indicating whether the character exists.
   */
  async existsForAddress(
    address: Address,
    overrides: ReadOverrides<Entry, 'getPrimaryCharacterId'> = {},
  ): Promise<Result<boolean>> {
    validateAddress(address)
    const characterId = await this.base.contract.read.getPrimaryCharacterId(
      [address],
      overrides,
    )

    const exists = characterId !== 0n
    return {
      data: exists,
    }
  }

  /**
   * This checks if a character exists.
   * @category Character
   * @param handle - The handle of a character.
   * @returns A boolean indicating whether the character exists.
   */
  async existsForHandle(
    handle: string,
    overrides: ReadOverrides<Entry, 'getCharacterByHandle'> = {},
  ): Promise<Result<boolean>> {
    const data = await this.base.contract.read.getCharacterByHandle(
      [handle],
      overrides,
    )
    const exists = data.handle !== ''
    return {
      data: exists,
    }
  }

  /**
   * This withdraws a character from the Newbie Villa contract.
   * @category Character
   * @param toAddress - The address of the user that will receive the character.
   * @param characterId - The character ID of the character you want to withdraw.
   * @param nonce - The nonce given from the server
   * @param expires - The expiration time given from the server
   * @param proof - The proof given from the server
   * @returns The transaction hash.
   */
  @autoSwitchMainnet()
  async withdrawFromNewbieVilla(
    toAddress: Address,
    characterId: Numberish,
    nonce: Numberish,
    expires: Numberish,
    proof: Address,
    overrides: WriteOverrides<NewbieVilla, 'withdraw'> = {},
  ): Promise<Result<undefined, true>> {
    validateAddress(toAddress)

    const tx = await this.base.newbieVillaContract.write.withdraw(
      [toAddress, BigInt(characterId), BigInt(nonce), BigInt(expires), proof],
      overrides,
    )

    const receipt = await this.base.publicClient.waitForTransactionReceipt({
      hash: tx,
    })

    return {
      data: undefined,
      transactionHash: receipt.transactionHash,
    }
  }

  /**
   * This validates if a handle is in a correct format.
   * @param handle - The handle of the character you want to get the social token for.
   */
  #validateHandleFormat(handle: string): void {
    if (handle.length >= 32 || handle.length <= 2) {
      throw new Error(
        `Invalid handle: handle must be between 3 and 31 characters.`,
      )
    }

    if (!/^[\d_a-z-]+$/.test(handle)) {
      throw new Error(`Invalid handle: handle must only contain [a-z0-9-_].`)
    }
  }
}
