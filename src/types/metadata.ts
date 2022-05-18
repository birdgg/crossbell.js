export type BaseMetadata = {
  // version: '1' // TODO: do we need this?

  type?: 'profile' | 'note' | 'linklist'
}

export type ProfileMetadata = BaseMetadata & {
  /** The name of this profile. */
  name?: string

  /**
   * The avatars of this profile.
   * The first avatar is the primary avatar.
   * @example
   * ['ipfs://Qm...', 'ipfs://Qm...']
   **/
  avatars?: string[]

  /** The bio of this profile. */
  bio?: string

  /**
   * The websites of this profile.
   * @example
   * ['https://example.com', 'https://example.org']
   */
  websites?: string[]

  /**
   * The social links of this profile. It should follow the csb:// scheme.
   *
   * The format is `csb://account:<identity>@<platform>`.
   *
   * @example
   * ['csb://account:someone@twitter', 'csb://account:someone@github']
   */
  connected_accounts?: string[]

  /**
   * The special connected avatars of this profile. it should follow the csb:// scheme.
   *
   * Use case: use an NFT as avatar.
   *
   * The format is `csb://asset:<contract_address>-<token_id>@<network>`.
   *
   * @example
   * ['csb://asset:0x5452c7fb99d99fab3cc1875e9da9829cb50f7a13-753@ethereum']
   */
  connected_avatars?: string[]
}
