import { describe, expect, test } from 'vitest'
import { createIndexer } from '../../src'

const indexer = createIndexer()
const characterId = 55926

describe('notification', () => {
  test('get many', () => {
    indexer.notification.getMany(characterId).then((notifications) => {
      expect(notifications.list).is.an('array')
      expect(notifications.count).is.an('number')
    })
  })

  test('unread count', () => {
    indexer.notification.getUnreadCount(characterId).then(({ count }) => {
      expect(count).is.a('number')
    })
  })
})
