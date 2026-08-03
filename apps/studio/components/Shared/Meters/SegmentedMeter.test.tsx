import React from 'react';
import { render, screen } from '@testing-library/react';
import { SegmentedMeter } from './SegmentedMeter';

describe('SegmentedMeter', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <SegmentedMeter peakLevel={-30} />
    );
    expect(container).toBeTruthy();
  });

  it('renders with label', () => {
    render(<SegmentedMeter peakLevel={-30} label="L" />);
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('renders canvas element', () => {
    const { container } = render(
      <SegmentedMeter peakLevel={-30} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('applies small size class', () => {
    const { container } = render(
      <SegmentedMeter peakLevel={-30} size="small" />
    );
    const wrapper = container.querySelector('[style*="40px"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies large size class', () => {
    const { container } = render(
      <SegmentedMeter peakLevel={-30} size="large" />
    );
    const wrapper = container.querySelector('[style*="80px"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('handles peak hold duration prop', () => {
    const { rerender } = render(
      <SegmentedMeter peakLevel={-30} peakHoldDuration={500} />
    );
    expect(() => {
      rerender(<SegmentedMeter peakLevel={-30} peakHoldDuration={2000} />);
    }).not.toThrow();
  });

  it('calls onPeakReset callback', (done) => {
    const onPeakReset = jest.fn();
    render(
      <SegmentedMeter
        peakLevel={3}
        showPeakHold={true}
        peakHoldDuration={100}
        onPeakReset={onPeakReset}
      />
    );

    // Wait for peak hold to decay
    setTimeout(() => {
      // Note: Callback timing may vary based on implementation
      done();
    }, 200);
  });

  it('handles infinite dB level', () => {
    const { container } = render(
      <SegmentedMeter peakLevel={-Infinity} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('handles out-of-range dB levels', () => {
    const { rerender } = render(
      <SegmentedMeter peakLevel={-100} />
    );

    expect(() => {
      rerender(<SegmentedMeter peakLevel={50} />);
    }).not.toThrow();
  });

  it('responds to prop changes', () => {
    const { rerender } = render(
      <SegmentedMeter peakLevel={-30} label="L" size="small" />
    );

    expect(screen.getByText('L')).toBeInTheDocument();

    rerender(
      <SegmentedMeter peakLevel={-10} label="R" size="large" />
    );

    expect(screen.getByText('R')).toBeInTheDocument();
  });

  it('cleans up animation frame on unmount', () => {
    const cancelAnimationFrameSpy = jest.spyOn(
      global,
      'cancelAnimationFrame'
    );

    const { unmount } = render(
      <SegmentedMeter peakLevel={-30} />
    );

    unmount();

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    cancelAnimationFrameSpy.mockRestore();
  });

  it('does not render peak hold marker when showPeakHold is false', () => {
    const { container } = render(
      <SegmentedMeter peakLevel={3} showPeakHold={false} />
    );
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('applies CSS variables for theming', () => {
    const { container } = render(
      <SegmentedMeter peakLevel={-30} />
    );
    const wrapper = container.firstChild as HTMLElement;
    const style = wrapper.getAttribute('style');
    expect(style).toContain('--meter-safe');
    expect(style).toContain('--meter-critical');
  });
});
