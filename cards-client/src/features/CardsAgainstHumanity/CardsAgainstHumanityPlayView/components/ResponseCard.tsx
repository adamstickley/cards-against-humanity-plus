import React from 'react';
import { Card, Text } from '@radix-ui/themes';
import { ICahCard } from '../../types';

interface ResponseCardProps {
  card: ICahCard;
  selected?: boolean;
  selectionOrder?: number;
  onClick?: () => void;
  disabled?: boolean;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  card,
  selected = false,
  selectionOrder,
  onClick,
  disabled = false,
}) => {
  return (
    <Card
      size="2"
      onClick={disabled ? undefined : onClick}
      style={{
        minHeight: '150px',
        cursor: disabled ? 'default' : 'pointer',
        backgroundColor: selected ? 'var(--accent-3)' : 'white',
        border: selected
          ? '2px solid var(--accent-9)'
          : '1px solid var(--gray-6)',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        position: 'relative',
      }}
    >
      {selectionOrder !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-9)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          {selectionOrder}
        </div>
      )}
      <Text size="3" style={{ color: 'var(--gray-12)' }}>
        {card.text}
      </Text>
    </Card>
  );
};
