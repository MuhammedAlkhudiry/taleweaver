import Block from './Block';

/**
 * Paragraph block.
 */
export default class Paragraph extends Block {
  static getType(): string {
    return 'Paragraph';
  }

  getType(): string {
    return Paragraph.getType();
  }
}
