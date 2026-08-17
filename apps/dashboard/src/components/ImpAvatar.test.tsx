/**
 * Unit tests for ImpAvatar component
 * Tests rendering, props, image paths, and accessibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImpAvatar } from './ImpAvatar';
import { ImpExpression, ImpColorVariant } from '../types/imp';

describe('ImpAvatar Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ImpAvatar expression="idle" />);
      expect(screen.getByAltText(/WISE² Personal IMP/)).toBeInTheDocument();
    });

    it('should render with correct alt text including expression', () => {
      render(<ImpAvatar expression="thinking" />);
      expect(
        screen.getByAltText(/WISE² Personal IMP - thinking/)
      ).toBeInTheDocument();
    });

    it('should render for all expression types', () => {
      const expressions: ImpExpression[] = [
        'idle',
        'listening',
        'thinking',
        'speaking',
        'happy',
        'curious',
        'focused',
        'playful',
        'warning',
        'error',
        'sleeping',
        'offline',
      ];

      expressions.forEach(expr => {
        const { unmount } = render(<ImpAvatar expression={expr} />);
        expect(
          screen.getByAltText(new RegExp(`WISE² Personal IMP - ${expr}`))
        ).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Image Sources', () => {
    it('should render picture element with WebP source', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      const source = container.querySelector('source[type="image/webp"]');
      expect(source).toBeInTheDocument();
    });

    it('should generate correct WebP path for idle blue', () => {
      const { container } = render(
        <ImpAvatar expression="idle" colorVariant="blue" />
      );
      const source = container.querySelector('source[type="image/webp"]');
      expect(source).toHaveAttribute('srcSet', '/wise-imp/idle-blue.webp');
    });

    it('should render PNG fallback', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img?.src).toContain('idle-blue.png');
    });

    it('should handle different expressions with correct mapping', () => {
      const testCases = [
        { expr: 'happy', expected: 'celebrate' },
        { expr: 'thinking', expected: 'thinking' },
        { expr: 'listening', expected: 'wave' },
        { expr: 'idle', expected: 'idle' },
      ];

      testCases.forEach(({ expr, expected }) => {
        const { container, unmount } = render(
          <ImpAvatar expression={expr as ImpExpression} />
        );
        const img = container.querySelector('img');
        expect(img?.src).toContain(expected);
        unmount();
      });
    });

    it('should handle all color variants', () => {
      const variants: ImpColorVariant[] = ['blue', 'gold', 'green', 'magenta'];

      variants.forEach(variant => {
        const { container, unmount } = render(
          <ImpAvatar expression="idle" colorVariant={variant} />
        );
        const img = container.querySelector('img');
        expect(img?.src).toContain(`-${variant}.png`);
        unmount();
      });
    });
  });

  describe('Size Props', () => {
    it('should apply sm size class', () => {
      const { container } = render(
        <ImpAvatar expression="idle" size="sm" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-16', 'h-16');
    });

    it('should apply md size class by default', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-24', 'h-24');
    });

    it('should apply md size class explicitly', () => {
      const { container } = render(
        <ImpAvatar expression="idle" size="md" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-24', 'h-24');
    });

    it('should apply lg size class', () => {
      const { container } = render(
        <ImpAvatar expression="idle" size="lg" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('w-32', 'h-32');
    });
  });

  describe('Animation Props', () => {
    it('should apply transition classes when animated is true', () => {
      const { container } = render(
        <ImpAvatar expression="idle" animated={true} />
      );
      const picture = container.querySelector('picture');
      expect(picture).toHaveClass('transition-opacity', 'duration-300');
    });

    it('should apply transition classes by default', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      const picture = container.querySelector('picture');
      expect(picture).toHaveClass('transition-opacity', 'duration-300');
    });

    it('should not apply transition classes when animated is false', () => {
      const { container } = render(
        <ImpAvatar expression="idle" animated={false} />
      );
      const picture = container.querySelector('picture');
      expect(picture).not.toHaveClass('transition-opacity');
    });
  });

  describe('Custom Classes', () => {
    it('should apply custom className prop', () => {
      const { container } = render(
        <ImpAvatar expression="idle" className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should merge custom classes with default classes', () => {
      const { container } = render(
        <ImpAvatar expression="idle" className="custom-class" />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'items-center', 'custom-class');
    });

    it('should apply multiple custom classes', () => {
      const { container } = render(
        <ImpAvatar
          expression="idle"
          className="shadow-xl border-2 border-red-500"
        />
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass(
        'shadow-xl',
        'border-2',
        'border-red-500'
      );
    });
  });

  describe('Image Loading', () => {
    it('should have lazy loading enabled', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('should have object-cover class for proper image scaling', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to container div', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ImpAvatar ref={ref} expression="idle" />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should allow accessing container properties via ref', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ImpAvatar ref={ref} expression="idle" />);
      expect(ref.current?.className).toContain('flex');
      expect(ref.current?.className).toContain('items-center');
    });
  });

  describe('Display Name', () => {
    it('should have correct display name for debugging', () => {
      expect(ImpAvatar.displayName).toBe('ImpAvatar');
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive alt text', () => {
      render(<ImpAvatar expression="thinking" />);
      const img = screen.getByAltText(/WISE² Personal IMP/);
      expect(img.getAttribute('alt')).toContain('thinking');
    });

    it('should be keyboard accessible (rendered naturally)', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      // Image should be rendered as part of natural DOM, not hidden
      const img = container.querySelector('img');
      expect(img).toBeVisible();
    });

    it('should have proper semantic HTML structure', () => {
      const { container } = render(<ImpAvatar expression="idle" />);
      const picture = container.querySelector('picture');
      const source = picture?.querySelector('source');
      const img = picture?.querySelector('img');

      expect(picture).toBeInTheDocument();
      expect(source).toBeInTheDocument();
      expect(img).toBeInTheDocument();
    });
  });

  describe('Props Combinations', () => {
    it('should handle all prop combinations', () => {
      const expressions: ImpExpression[] = [
        'idle',
        'thinking',
        'happy',
        'error',
      ];
      const variants: ImpColorVariant[] = ['blue', 'gold', 'green', 'magenta'];
      const sizes = ['sm', 'md', 'lg'] as const;

      expressions.forEach(expr => {
        variants.forEach(variant => {
          sizes.forEach(size => {
            const { unmount } = render(
              <ImpAvatar
                expression={expr}
                colorVariant={variant}
                size={size}
                animated={true}
              />
            );
            expect(
              screen.getByAltText(new RegExp(`WISE² Personal IMP - ${expr}`))
            ).toBeInTheDocument();
            unmount();
          });
        });
      });
    });
  });

  describe('Memoization', () => {
    it('should use useMemo for image paths', () => {
      const { container, rerender } = render(
        <ImpAvatar expression="idle" colorVariant="blue" />
      );
      const img1 = container.querySelector('img');
      const src1 = img1?.src;

      // Re-render with same props
      rerender(<ImpAvatar expression="idle" colorVariant="blue" />);
      const img2 = container.querySelector('img');
      const src2 = img2?.src;

      // Paths should be the same
      expect(src1).toBe(src2);
    });

    it('should update paths when expression changes', () => {
      const { container, rerender } = render(
        <ImpAvatar expression="idle" colorVariant="blue" />
      );
      let img = container.querySelector('img');
      expect(img?.src).toContain('idle-blue');

      rerender(<ImpAvatar expression="thinking" colorVariant="blue" />);
      img = container.querySelector('img');
      expect(img?.src).toContain('thinking-blue');
    });

    it('should update paths when color variant changes', () => {
      const { container, rerender } = render(
        <ImpAvatar expression="idle" colorVariant="blue" />
      );
      let img = container.querySelector('img');
      expect(img?.src).toContain('-blue');

      rerender(<ImpAvatar expression="idle" colorVariant="green" />);
      img = container.querySelector('img');
      expect(img?.src).toContain('-green');
    });
  });
});
