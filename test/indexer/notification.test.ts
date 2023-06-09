import { describe, it } from 'vitest'
import { createIndexer } from '../../src'

const indexer = createIndexer()
const characterId = 55926

describe.concurrent('notification', () => {
  it('get many', async ({ expect }) => {
    const notifications = await indexer.notification.getMany(characterId)
    expect(notifications.list).is.an('array')
    expect(notifications.count).is.an('number')
  })

  it('unread count', async ({ expect }) => {
    const { count } = await indexer.notification.getUnreadCount(characterId)
    expect(count).is.a('number')
  })
})
