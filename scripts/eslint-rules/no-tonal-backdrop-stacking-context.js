/**
 * ESLint rule: no-tonal-backdrop-stacking-context
 *
 * Prevents any ancestor of the tonal backdrop (`data-tonal-backdrop="root"`)
 * from creating a stacking context, which would cause the backdrop (z-index: -10)
 * to paint above static content instead of behind it.
 *
 * Stacking context creating properties (per CSS spec):
 * - z-index (not auto)
 * - transform (not none)
 * - opacity (< 1)
 * - filter (not none)
 * - perspective (not none)
 * - contain (layout, paint, strict, content)
 * - will-change (transform, opacity, filter, etc.)
 * - isolation: isolate
 * - mix-blend-mode (not normal)
 * - -webkit-overflow-scrolling: touch
 */

const STACKING_CONTEXT_PROPERTIES = new Set([
  'zIndex',
  'z-index',
  'transform',
  'opacity',
  'filter',
  'perspective',
  'contain',
  'willChange',
  'will-change',
  'isolation',
  'mixBlendMode',
  'mix-blend-mode',
  'webkitOverflowScrolling',
  '-webkit-overflow-scrolling',
]);

const STACKING_CONTEXT_VALUES = new Set([
  'isolate',
  'layout',
  'paint',
  'strict',
  'content',
  'transform',
  'opacity',
  'filter',
  'touch',
]);

function createsStackingContext(node) {
  if (!node || node.type !== 'JSXAttribute') return false;
  const name = node.name?.name;
  if (!name) return false;

  // Check style prop: style={{ zIndex: 1, transform: 'translateX(10px)' }}
  if (name === 'style' && node.value?.type === 'JSXExpressionContainer') {
    const expr = node.value.expression;
    if (expr.type === 'ObjectExpression') {
      return expr.properties.some(prop => {
        const key = prop.key?.name || prop.key?.value;
        if (!key) return false;
        const normalizedKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        if (!STACKING_CONTEXT_PROPERTIES.has(normalizedKey) && !STACKING_CONTEXT_PROPERTIES.has(key)) {
          return false;
        }
        // For z-index, check it's not 'auto'
        if (key === 'zIndex' || key === 'z-index') {
          const val = prop.value?.value;
          return val !== undefined && val !== 'auto' && val !== null;
        }
        // For opacity, check it's < 1
        if (key === 'opacity') {
          const val = prop.value?.value;
          return typeof val === 'number' && val < 1;
        }
        // For contain, check it's a stacking context value
        if (key === 'contain') {
          const val = prop.value?.value;
          return typeof val === 'string' && STACKING_CONTEXT_VALUES.has(val);
        }
        // For isolation, check it's 'isolate'
        if (key === 'isolation') {
          const val = prop.value?.value;
          return val === 'isolate';
        }
        // For mix-blend-mode, check it's not 'normal'
        if (key === 'mixBlendMode' || key === 'mix-blend-mode') {
          const val = prop.value?.value;
          return val !== 'normal';
        }
        // For will-change, check it contains stacking context triggers
        if (key === 'willChange' || key === 'will-change') {
          const val = prop.value?.value;
          return typeof val === 'string' && val.split(',').some(v => STACKING_CONTEXT_VALUES.has(v.trim()));
        }
        // For -webkit-overflow-scrolling: touch
        if (key === 'webkitOverflowScrolling' || key === '-webkit-overflow-scrolling') {
          const val = prop.value?.value;
          return val === 'touch';
        }
        // For transform, filter, perspective - any non-none value creates stacking context
        return true;
      });
    }
  }

  // Check className for Tailwind classes that create stacking context
  if (name === 'className' || name === 'class') {
    const classValue = node.value?.value || (node.value?.expression?.value);
    if (typeof classValue === 'string') {
      const classes = classValue.split(/\s+/);
      // Tailwind classes that create stacking context:
      // z-[value] (not z-auto), relative/absolute/fixed with z-index,
      // transform, opacity-[value<100], filter, perspective, isolate,
      // mix-blend-[not normal], will-change-[transform/opacity/filter]
      return classes.some(cls => {
        if (cls.startsWith('z-') && cls !== 'z-auto' && cls !== 'z-0') return true;
        if (cls === 'relative' || cls === 'absolute' || cls === 'fixed' || cls === 'sticky') {
          // These only create stacking context if they have z-index, but we can't know statically
          // Flag as potential - developer must ensure no z-index
        }
        if (cls.startsWith('transform') && cls !== 'transform-none') return true;
        if (cls.startsWith('opacity-')) {
          const val = parseInt(cls.replace('opacity-', ''), 10);
          if (!isNaN(val) && val < 100) return true;
        }
        if (cls.startsWith('filter') && cls !== 'filter-none') return true;
        if (cls.startsWith('perspective') && cls !== 'perspective-none') return true;
        if (cls === 'isolate' || cls === 'isolation-isolate') return true;
        if (cls.startsWith('mix-blend-') && cls !== 'mix-blend-normal') return true;
        if (cls.startsWith('will-change-')) {
          const prop = cls.replace('will-change-', '');
          if (['transform', 'opacity', 'filter'].includes(prop)) return true;
        }
        return false;
      });
    }
  }

  return false;
}

function hasTonalBackdropDescendant(node) {
  if (!node || !node.children) return false;
  return node.children.some(child => {
    if (child.type === 'JSXElement') {
      const hasAttr = child.openingElement.attributes.some(attr => {
        return attr.name?.name === 'data-tonal-backdrop' &&
               attr.value?.value === 'root';
      });
      if (hasAttr) return true;
      return hasTonalBackdropDescendant(child);
    }
    if (child.type === 'JSXFragment') {
      return hasTonalBackdropDescendant(child);
    }
    return false;
  });
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent stacking context on ancestors of tonal backdrop',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      stackingContext:
        'Element creates a stacking context ({{property}}) and is an ancestor of the tonal backdrop (data-tonal-backdrop="root"). ' +
        'This causes the backdrop (z-index: -10) to paint above static content. ' +
        'Remove the stacking context property or move the tonal backdrop outside this element.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    return {
      JSXElement(node) {
        // Check if this element or any ancestor has the tonal backdrop descendant
        if (!hasTonalBackdropDescendant(node)) return;

        // Check this element's attributes for stacking context creators
        for (const attr of node.openingElement.attributes) {
          if (createsStackingContext(attr)) {
            const propName = attr.name?.name || 'unknown';
            context.report({
              node: attr,
              messageId: 'stackingContext',
              data: { property: propName },
            });
          }
        }
      },
    };
  },
};