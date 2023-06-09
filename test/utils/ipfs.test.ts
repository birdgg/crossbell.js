import { describe, it } from 'vitest'
import { ipfsUploadJson } from '../../src/ipfs'

describe.concurrent('ipfs', () => {
  it('uploadJson', async ({ expect }) => {
    const res = await ipfsUploadJson({
      type: 'character',
      name: 'test',
    })

    expect(res.status).toBe('ok')
    expect(res.cid).toBeDefined()
    expect(res.url).toBeDefined()
    expect(res.web2url).toBeDefined()
  })
})
