'use client';

import React from 'react';
import { WidgetProps } from '@types/widget';
import styles from '@styles/widgets.module.css';

export const Widget: React.FC<WidgetProps> = ({
  widget,
  data,
  loading = false,
  error = null,
  onRefresh,
  onConfigure,
  onRemove,
  children,
}) => {
  return (
    <div
      className={styles.widget}
      style={{
        gridColumn: `span ${widget.gridPosition.width}`,
        gridRow: `span ${widget.gridPosition.height}`,
      }}
    >
      <div className={styles.widgetHeader}>
        <div className={styles.widgetTitle}>
          <h3>{widget.title}</h3>
          {widget.description && (
            <span className={styles.widgetDescription}>{widget.description}</span>
          )}
        </div>
        <div className={styles.widgetActions}>
          {loading && <span className={styles.loading}>⟳</span>}
          {onRefresh && (
            <button
              className={styles.actionButton}
              onClick={onRefresh}
              title="Refresh"
              aria-label="Refresh"
            >
              ⟳
            </button>
          )}
          {onConfigure && (
            <button
              className={styles.actionButton}
              onClick={onConfigure}
              title="Configure"
              aria-label="Configure"
            >
              ⚙
            </button>
          )}
          {onRemove && (
            <button
              className={styles.actionButton}
              onClick={onRemove}
              title="Remove"
              aria-label="Remove"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className={styles.widgetContent}>
        {error && <div className={styles.error}>{error.message}</div>}
        {loading && !data && <div className={styles.skeleton}>Loading...</div>}
        {data && children}
      </div>
    </div>
  );
};

export default Widget;
