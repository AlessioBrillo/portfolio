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
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
    ] as const;

    for (const tag of expected) {
      expect(typeof mdxComponents[tag], `missing map for <${tag}>`).toBe('function');
    }
  });

  it('renders level-2 headings in the display face at section scale', () => {
    const H2 = mdxComponents.h2!;
    render(<H2>Context</H2>);
    expect(screen.getByRole('heading', { level: 2, name: 'Context' })).toHaveClass('font-display');
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
    expect(screen.getByText('loss = 3.2')).toHaveClass('bg-night', 'text-phosphor');
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

  it('renders blockquotes with the accent editorial edge', () => {
    const Blockquote = mdxComponents.blockquote!;
    render(<Blockquote>Quote</Blockquote>);
    expect(screen.getByText('Quote')).toHaveClass(
      'border-l-[var(--hairline-thick)]',
      'border-accent',
    );
  });

  it('keeps the accent underline link treatment', () => {
    const A = mdxComponents.a!;
    render(<A href="https://example.com">link</A>);
    expect(screen.getByRole('link', { name: 'link' })).toHaveClass(
      'underline',
      'decoration-accent',
    );
  });

  it('renders horizontal rules as hairline separators', () => {
    const Hr = mdxComponents.hr!;
    render(<Hr />);
    expect(document.querySelector('hr')).toHaveClass('border-t', 'border-ink/10');
  });

  it('renders paragraphs with relaxed leading and balanced text', () => {
    const P = mdxComponents.p!;
    render(<P>Body copy</P>);
    expect(screen.getByText('Body copy')).toHaveClass('leading-relaxed', 'text-pretty');
  });

  it('styles ordered lists with decimal markers', () => {
    const Ol = mdxComponents.ol!;
    render(
      <Ol>
        <li>step</li>
      </Ol>,
    );
    expect(screen.getByRole('list')).toHaveClass('list-decimal');
  });

  it('renders list items with relaxed leading', () => {
    const Li = mdxComponents.li!;
    render(<Li>entry</Li>);
    expect(screen.getByText('entry')).toHaveClass('leading-relaxed');
  });

  it('renders strong emphasis in the semibold face', () => {
    const Strong = mdxComponents.strong!;
    render(<Strong>key</Strong>);
    expect(screen.getByText('key')).toHaveClass('font-semibold');
  });

  it('renders emphasis in the italic face', () => {
    const Em = mdxComponents.em!;
    render(<Em>hint</Em>);
    expect(screen.getByText('hint')).toHaveClass('italic');
  });

  it('frames run-log tables as a card with horizontal scroll on narrow widths', () => {
    const Table = mdxComponents.table!;
    render(
      <Table>
        <tbody>
          <tr>
            <td>cell</td>
          </tr>
        </tbody>
      </Table>,
    );
    expect(document.querySelector('.overflow-x-auto')).toBeTruthy();
    expect(document.querySelector('table')).toHaveClass('w-full', 'border-collapse', 'text-left');
  });

  it('passes the table head through untouched', () => {
    const Thead = mdxComponents.thead!;
    render(
      <Thead>
        <tr>
          <th>header</th>
        </tr>
      </Thead>,
    );
    expect(document.querySelector('thead')).toBeTruthy();
    expect(screen.getByText('header')).toBeInTheDocument();
  });

  it('passes the table body through untouched', () => {
    const Tbody = mdxComponents.tbody!;
    render(
      <Tbody>
        <tr>
          <td>body</td>
        </tr>
      </Tbody>,
    );
    expect(document.querySelector('tbody')).toBeTruthy();
    expect(screen.getByText('body')).toBeInTheDocument();
  });

  it('styles table headers in the mono eyebrow treatment', () => {
    const Th = mdxComponents.th!;
    render(<Th scope="col">Signal</Th>);
    expect(screen.getByRole('columnheader', { name: 'Signal' })).toHaveClass(
      'font-mono',
      'uppercase',
      'tracking-widest',
      'text-ink-soft',
    );
  });

  it('gives table cells breathing room on the paper surface', () => {
    const Td = mdxComponents.td!;
    render(<Td>42</Td>);
    expect(screen.getByRole('cell', { name: '42' })).toHaveClass('px-4', 'py-2.5', 'align-top');
  });

  it('draws hairline row separators', () => {
    const Tr = mdxComponents.tr!;
    render(<Tr />);
    expect(document.querySelector('tr')).toHaveClass('border-b', 'border-ink/10');
  });
});
