import { describe, it } from 'vitest'
import { createIndexer } from '../../src'
import { mockUser } from '../mock'

const indexer = createIndexer()

describe.concurrent('characters', () => {
  it('getCharacters', async ({ expect }) => {
    const res = await indexer.character.getMany(mockUser.address)
    expect(res.list).toBeInstanceOf(Array)
  })

  it('getPrimaryCharacters', async ({ expect }) => {
    const res = await indexer.character.getPrimary(mockUser.address)
    expect(res?.handle).toBeDefined()
  })
})

describe.concurrent('links', () => {
  it('getLinklists', async ({ expect }) => {
    const res = await indexer.linklist.getMany(10n)
    expect(res.list).toBeInstanceOf(Array)
  })

  it('getLinkingItems', async ({ expect }) => {
    const res = await indexer.link.getMany(10n, {
      linkType: 'follow',
      linkItemType: 'Character',
    })
    expect(res.list).toBeInstanceOf(Array)
  })

  it('getBacklinkingItems', async ({ expect }) => {
    const res = await indexer.linklist.getMany(10n, {
      linkType: 'follow',
    })

    expect(res.list).toBeInstanceOf(Array)
  })
})

// TODO: more apis
