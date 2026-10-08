import React from 'react';
import styles from './AgentCard.module.css';

/**
 * Agent Card Component
 * Displays agent role, automation level, SOP, and responsibilities
 */

interface AgentCardProps {
  id: string;
  category: string;
  title: string;
  description: string;
  ladder: {
    humanLed: string;
    humanAssisted: string;
    fullyAutonomous: string;
  };
  humanRole: string;
  doneBy: {
    agent: string;
    type: string;
    ratio?: string;
  };
  sop: Array<{
    step: number;
    description: string;
  }>;
  selected?: boolean;
  onClick?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  id,
  category,
  title,
  description,
  ladder,
  humanRole,
  doneBy,
  sop,
  selected = false,
  onClick,
}) => {
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.category}>
          {category} · {title}
        </div>
      </div>

      {/* Description */}
      <div className={styles.description}>{description}</div>

      {/* The Ladder - Automation Levels */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>THE LADDER</h4>
        <div className={styles.ladder}>
          <div className={styles.ladderStep}>
            <span className={styles.level}>HUMAN-LED</span>
            <span className={styles.description}>{ladder.humanLed}</span>
          </div>
          <div className={styles.ladderStep}>
            <span className={styles.level}>HUMAN-ASSISTED</span>
            <span className={styles.description}>{ladder.humanAssisted}</span>
          </div>
          <div className={styles.ladderStep}>
            <span className={styles.level}>FULLY AUTONOMOUS</span>
            <span className={styles.description}>{ladder.fullyAutonomous}</span>
          </div>
        </div>
      </div>

      {/* The Human - Role Description */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>THE HUMAN</h4>
        <p className={styles.humanRole}>{humanRole}</p>
      </div>

      {/* Done By - Agent Assignment */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>DONE BY</h4>
        <div className={styles.agentAssignment}>
          <div className={styles.agentName}>{doneBy.agent}</div>
          <div className={styles.agentType}>{doneBy.type}</div>
          {doneBy.ratio && (
            <div className={styles.agentRatio}>{doneBy.ratio}</div>
          )}
        </div>
      </div>

      {/* Standard Operating Procedure */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>THE SOP, WRITTEN OUT</h4>
        <div className={styles.sop}>
          {sop.map((step) => (
            <div key={step.step} className={styles.sopStep}>
              <span className={styles.sopNumber}>
                {String(step.step).padStart(2, '0')}
              </span>
              <span className={styles.sopDescription}>{step.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
