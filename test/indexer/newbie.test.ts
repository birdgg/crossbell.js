import { describe, it } from 'vitest'
import { createIndexer } from '../../src'
import { mockUser } from '../mock'

const indexer = createIndexer()

describe('newbie', () => {
  it('sign in', async ({ expect }) => {
    const token = await indexer.newbie.signIn(mockUser.email, mockUser.password)
    expect(token).toBeTruthy()
    expect(token).toEqual(indexer.newbie.token)
  })

  it('current user', async ({ expect }) => {
    const account = await indexer.newbie.getAccount()
    expect(account.email).toEqual(mockUser.email)
    expect(account.characterId).to.be.a('number')
  })
})
