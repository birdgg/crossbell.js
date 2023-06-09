import { describe, test } from 'vitest'
import { createIndexer } from '../../src'
import { mockUser } from '../mock'

const indexer = createIndexer()

describe.concurrent('characters', () => {
  test.concurrent('getCharacters', async ({ expect }) => {
    const res = await indexer.character.getMany(mockUser.address)
    expect(res.list).toBeInstanceOf(Array)
  })

  test.concurrent('getPrimaryCharacters', async ({ expect }) => {
    const res = await indexer.character.getPrimary(mockUser.address)
    expect(res?.handle).toBeDefined()
  })
})

describe.concurrent('links', () => {
  test.concurrent('getLinklists', async ({ expect }) => {
    const res = await indexer.linklist.getMany(10n)
    expect(res.list).toBeInstanceOf(Array)
  })

  test.concurrent('getLinkingItems', async ({ expect }) => {
    const res = await indexer.link.getMany(10n, {
      linkType: 'follow',
      linkItemType: 'Character',
    })
    expect(res.list).toBeInstanceOf(Array)
  })

  test.concurrent('getBacklinkingItems', async ({ expect }) => {
    const res = await indexer.linklist.getMany(10n, {
      linkType: 'follow',
    })

    expect(res.list).toBeInstanceOf(Array)
  })
})

// TODO: more apis
