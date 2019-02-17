import WordView, { WordViewConfig, WordViewPositionBox, WordViewDOMElements } from './WordView';
import Word from '../model/word/Word';
import TextWord from '../model/word/TextWord';
import measureText from './helpers/measureText';

const placeholderTextStyle = {
  fontFamily: 'Arial',
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 36,
  letterSpacing: 0,
};

/**
 * View for a text word.
 */
export default class TextView extends WordView {
  /** Cached width of the rendered text word */
  private width?: number;
  /** Cached height of the rendered text word */
  private height?: number;
  /** Whether the view is mounted to DOM. */
  private mounted: boolean;
  /** DOM text node. */
  private domTextWord?: Text;

  constructor(word: Word, config: WordViewConfig) {
    super(word, config);
    this.mounted = false;
  }

  mount() {
    if (this.mounted) {
      return;
    }
    const { domLineContent } = this.getLineView().getDOM();
    const textWord = <TextWord> this.word;
    this.domTextWord = document.createTextNode(textWord.getText());
    domLineContent.appendChild(this.domTextWord);
    textWord.observe(() => {
      this.domTextWord!.replaceWith(textWord.getText());
    });
  }

  getDOM(): WordViewDOMElements {
    return {
      domWord: this.domTextWord!,
      domWordContent: this.domTextWord!,
    };
  }

  getWidth(): number {
    if (this.width === undefined) {
      this.measure();
    }
    return this.width!;
  }

  getHeight(): number {
    if (this.height === undefined) {
      this.measure();
    }
    return this.height!;
  }

  mapModelPositionRangeToViewPositionBox(from: number, to: number): WordViewPositionBox {
    return {
      x1: this.getScreenX(from),
      x2: this.getScreenX(to),
      height: this.getHeight(),
    };
  }

  mapViewPositionToModelPosition(x: number): number {
    const textWord = <TextWord> this.word;
    const text = textWord.getText();
    let lastWidth = 0;
    for (let n = 1, nn = text.length; n < nn; n++) {
      const width = measureText(text.substring(0, n), placeholderTextStyle).width;
      if (width > x) {
        if (x - lastWidth > width - x) {
          return n;
        }
        return n - 1;
      }
      lastWidth = width;
    }
    if (x === lastWidth) {
      return text.length - 1;
    }
    return text.length;
  }

  /**
   * Measures the dimensions of the rendered text word.
   */
  private measure() {
    const textWord = <TextWord> this.word;
    const measurement = measureText(textWord.getText(), placeholderTextStyle);
    this.width = measurement.width;
    this.height = measurement.height;
  }

  /**
   * Gets screen x coordinate by document position.
   * @param at - Document position within the text word.
   */
  private getScreenX(at: number): number {
    const textWord = <TextWord> this.word;
    const text = textWord.getText();
    if (at === 0) {
      return 0;
    }
    return measureText(text.substring(0, at), placeholderTextStyle).width;
  }
}
