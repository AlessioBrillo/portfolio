import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mdxComponents } from '@/content/mdx-components';

/**
 * The MDX block map is the missing half of the Phase 4 pipeline: Tailwind's
 * preflight neutralises heading styles, so without this map case-study bodies
 * render flat. These tests pin the typographic contract of the map.
 */
describe('mdxComponents', () => {
  it('maps every HTML block a case study uses', () => {
    const expected = [
      'h2',
      'h3',
      'p',
      'a',
      'ul',
      'ol',
      'li',
      'strong',
      'em',
      'code',
      'pre',
      'blockquote',
      'hr',
    ] as const;

    for (const tag of expected) {
      expect(typeof mdxComponents[tag], `missing map for <${tag}>`).toBe('function');
    }
  });

  it('renders level-2 headings in the display face at section scale', () => {
    const H2 = mdxComponents.h2!;
    render(<H2>Context</H2>);
    expect(screen.getByRole('heading', { level: 2, name: 'Context' })).toHaveClass(
      'font-display',
    );
  });

  it('renders level-3 headings in the display face at sub-section scale', () => {
    const H3 = mdxComponents.h3!;
    render(<H3>Tokenizer</H3>);
    expect(screen.getByRole('heading', { level: 3, name: 'Tokenizer' })).toHaveClass(
      'font-display',
    );
  });

  it('styles inline code in the mono face', () => {
    const Code = mdxComponents.code!;
    render(<Code>tokenizer.train()</Code>);
    expect(screen.getByText('tokenizer.train()')).toHaveClass('font-mono');
  });

  it('gives code blocks a night surface so they read as figures', () => {
    const Pre = mdxComponents.pre!;
    render(<Pre>loss = 3.2</Pre>);
    expect(screen.getByText('loss = 3.2')).toHaveClass('bg-night', 'text-cream');
  });

  it('styles unordered lists with markers', () => {
    const Ul = mdxComponents.ul!;
    render(
      <Ul>
        <li>item</li>
      </Ul>,
    );
    expect(screen.getByRole('list')).toHaveClass('list-disc');
  });

  it('renders blockquotes with the orange editorial edge', () => {
    const Blockquote = mdxComponents.blockquote!;
    render(<Blockquote>Quote</Blockquote>);
    expect(screen.getByText('Quote')).toHaveClass('border-l-2', 'border-orange');
  });

  it('keeps the orange underline link treatment', () => {
    const A = mdxComponents.a!;
    render(<A href="https://example.com">link</A>);
    expect(screen.getByRole('link', { name: 'link' })).toHaveClass(
      'underline',
      'decoration-orange',
    );
  });

  it('renders horizontal rules as hairline separators', () => {
    const Hr = mdxComponents.hr!;
    render(<Hr />);
    expect(document.querySelector('hr')).toHaveClass('border-t', 'border-ink/10');
  });
});