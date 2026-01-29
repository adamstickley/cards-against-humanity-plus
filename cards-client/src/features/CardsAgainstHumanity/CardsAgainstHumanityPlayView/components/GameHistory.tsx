import React, { useMemo } from 'react';
import { Box, Card, Flex, Heading, Text, ScrollArea } from '@radix-ui/themes';
import {
  PersonIcon,
  StarFilledIcon,
  PlayIcon,
  StopIcon,
  EnterIcon,
  ExitIcon,
  CardStackIcon,
  CheckCircledIcon,
} from '@radix-ui/react-icons';
import {
  ICahGameEvent,
  CahGameEventType,
  IWinnerSelectedEventData,
  IRoundStartedEventData,
  IPlayerJoinedEventData,
  IPlayerLeftEventData,
  ICardsSubmittedEventData,
  IGameEndedEventData,
} from '../../types';

interface GameHistoryProps {
  events: ICahGameEvent[];
  currentPlayerId?: number;
  maxHeight?: string;
}

const getEventIcon = (eventType: CahGameEventType) => {
  switch (eventType) {
    case 'SESSION_GAME_STARTED':
      return <PlayIcon color="var(--green-9)" />;
    case 'SESSION_GAME_ENDED':
      return <StopIcon color="var(--red-9)" />;
    case 'SESSION_PLAYER_JOINED':
      return <EnterIcon color="var(--green-9)" />;
    case 'SESSION_PLAYER_LEFT':
      return <ExitIcon color="var(--red-9)" />;
    case 'ROUND_STARTED':
      return <CardStackIcon color="var(--blue-9)" />;
    case 'ROUND_WINNER_SELECTED':
      return <StarFilledIcon color="var(--amber-9)" />;
    case 'ROUND_CARDS_SUBMITTED':
      return <CheckCircledIcon color="var(--gray-9)" />;
    default:
      return <PersonIcon color="var(--gray-9)" />;
  }
};

const formatEventMessage = (
  event: ICahGameEvent,
  currentPlayerId?: number,
): string => {
  const data = event.eventData;

  switch (event.eventType) {
    case 'SESSION_GAME_STARTED':
      return 'Game started';

    case 'SESSION_GAME_ENDED': {
      const endData = data as IGameEndedEventData;
      return `Game ended - ${endData?.winnerNickname || 'Unknown'} wins!`;
    }

    case 'SESSION_PLAYER_JOINED': {
      const joinData = data as IPlayerJoinedEventData;
      const isYou = event.playerId === currentPlayerId;
      return `${joinData?.nickname || 'Player'}${isYou ? ' (You)' : ''} joined`;
    }

    case 'SESSION_PLAYER_LEFT': {
      const leftData = data as IPlayerLeftEventData;
      const isYou = event.playerId === currentPlayerId;
      const reason =
        leftData?.reason === 'disconnected' ? ' (disconnected)' : '';
      return `${leftData?.nickname || 'Player'}${isYou ? ' (You)' : ''} left${reason}`;
    }

    case 'ROUND_STARTED': {
      const roundData = data as IRoundStartedEventData;
      const isYouJudge = roundData?.judgePlayerId === currentPlayerId;
      return `Round ${roundData?.roundNumber || event.roundNumber} started - ${roundData?.judgeNickname || 'Unknown'}${isYouJudge ? ' (You)' : ''} is Czar`;
    }

    case 'ROUND_CARDS_SUBMITTED': {
      const submitData = data as ICardsSubmittedEventData;
      const isYou = event.playerId === currentPlayerId;
      return `${submitData?.nickname || 'Player'}${isYou ? ' (You)' : ''} submitted`;
    }

    case 'ROUND_JUDGING_STARTED':
      return `Round ${event.roundNumber} - Judging started`;

    case 'ROUND_WINNER_SELECTED': {
      const winnerData = data as IWinnerSelectedEventData;
      const isYou = winnerData?.winnerId === currentPlayerId;
      return `${winnerData?.winnerNickname || 'Player'}${isYou ? ' (You)' : ''} won round ${winnerData?.roundNumber || event.roundNumber}`;
    }

    default:
      return event.eventType.replace(/_/g, ' ').toLowerCase();
  }
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const EVENT_TYPES_TO_SHOW: CahGameEventType[] = [
  'SESSION_GAME_STARTED',
  'SESSION_GAME_ENDED',
  'SESSION_PLAYER_JOINED',
  'SESSION_PLAYER_LEFT',
  'ROUND_STARTED',
  'ROUND_CARDS_SUBMITTED',
  'ROUND_WINNER_SELECTED',
];

export const GameHistory: React.FC<GameHistoryProps> = ({
  events,
  currentPlayerId,
  maxHeight = '300px',
}) => {
  const filteredEvents = useMemo(
    () =>
      events.filter((e) => EVENT_TYPES_TO_SHOW.includes(e.eventType)).reverse(),
    [events],
  );

  if (filteredEvents.length === 0) {
    return (
      <Card size="2">
        <Heading size="3" mb="3">
          Game History
        </Heading>
        <Text size="2" color="gray">
          No events yet
        </Text>
      </Card>
    );
  }

  return (
    <Card size="2">
      <Heading size="3" mb="3">
        Game History
      </Heading>
      <ScrollArea style={{ maxHeight }} scrollbars="vertical">
        <Flex direction="column" gap="2" pr="3">
          {filteredEvents.map((event) => {
            const isHighlight =
              event.eventType === 'ROUND_WINNER_SELECTED' ||
              event.eventType === 'SESSION_GAME_STARTED' ||
              event.eventType === 'SESSION_GAME_ENDED';

            return (
              <Flex
                key={event.eventId}
                align="center"
                gap="2"
                p="2"
                style={{
                  backgroundColor: isHighlight
                    ? 'var(--amber-2)'
                    : 'var(--gray-2)',
                  borderRadius: 'var(--radius-2)',
                }}
              >
                <Box style={{ flexShrink: 0 }}>
                  {getEventIcon(event.eventType)}
                </Box>
                <Text
                  size="2"
                  style={{ flex: 1 }}
                  weight={isHighlight ? 'medium' : 'regular'}
                >
                  {formatEventMessage(event, currentPlayerId)}
                </Text>
                <Text size="1" color="gray" style={{ flexShrink: 0 }}>
                  {formatTime(event.createdAt)}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </ScrollArea>
    </Card>
  );
};
