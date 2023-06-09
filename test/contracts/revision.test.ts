import { describe, expect, test } from 'vitest'
import { Contract } from '../../src'
import { mockUser } from '../mock'

const contract = new Contract(mockUser.privateKey)

describe('revision', () => {
  test('should return the latest revision', async () => {
    const { data: latest } = await contract.revision.getLatest()
    // eslint-disable-next-line no-console
    expect(latest > 0n).toBe(true)
    const { data: current } = contract.revision.getCurrent()
    expect(current).toBe(latest)
  })
  test('check', async () => {
    const res = await contract.revision.check()
    expect(res.data.currentRevision > 0n).toBe(true)
    expect(res.data.isUpToDate).is.a('boolean')
    expect(res.data.latestRevision > 0n).toBe(true)
  })
})
