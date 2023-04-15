import {
  type CharacterMetadata,
  type NoteMetadata,
  type Numberish,
} from '../../types'
import { BaseIndexer } from './base'

export class MetadataIndexer extends BaseIndexer {
  /**
   * (Re)sync a character's metadata.
   *
   * @param characterId - the character id
   */
  async syncMetadataOfCharacter(
    characterId: Numberish,
  ): Promise<CharacterMetadata | never> {
    const url = `${this.endpoint}/characters/${characterId}/metadata/sync`

    const res = await this.fetch(url).then((res) => res.json())

    return res as CharacterMetadata
  }

  /**
   * (Re)sync a notes's metadata.
   *
   * @param characterId - the character id of the note's owner
   * @param noteId - the note id
   */
  async syncMetadataOfNote(
    characterId: Numberish,
    noteId: Numberish,
  ): Promise<NoteMetadata | never> {
    const url = `${this.endpoint}/notes/${characterId}/${noteId}/metadata/sync`

    const res = await this.fetch(url).then((res) => res.json())

    return res as NoteMetadata
  }
}
