import React, { useCallback, useState } from 'react';
import { Box, Card, Flex, Text, Button, Badge } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import {
  ICahSessionSettings,
  ICahCardPack,
} from '../../../../api/clients/cah/CahSessionApi';

interface SessionInfoProps {
  code: string;
  settings: ICahSessionSettings;
  cardPacks: ICahCardPack[];
}

export const SessionInfo: React.FC<SessionInfoProps> = ({
  code,
  settings,
  cardPacks,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  }, [code]);

  return (
    <Card size="2">
      <Flex direction="column" gap="4">
        <Box>
          <Text size="2" color="gray" mb="1">
            Game Code
          </Text>
          <Flex align="center" gap="2">
            <Text
              size="7"
              weight="bold"
              style={{ letterSpacing: '0.1em', fontFamily: 'monospace' }}
            >
              {code}
            </Text>
            <Button
              variant="ghost"
              size="1"
              onClick={handleCopyCode}
              color={copied ? 'green' : 'gray'}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </Flex>
          <Text size="1" color="gray">
            Share this code with friends to let them join
          </Text>
        </Box>

        <Box>
          <Text size="2" color="gray" mb="2">
            Game Settings
          </Text>
          <Flex direction="column" gap="2">
            <Flex justify="between">
              <Text size="2">Score to Win</Text>
              <Text size="2" weight="medium">
                {settings.scoreToWin} points
              </Text>
            </Flex>
            <Flex justify="between">
              <Text size="2">Max Players</Text>
              <Text size="2" weight="medium">
                {settings.maxPlayers}
              </Text>
            </Flex>
            <Flex justify="between">
              <Text size="2">Cards per Hand</Text>
              <Text size="2" weight="medium">
                {settings.cardsPerHand}
              </Text>
            </Flex>
            {settings.roundTimerSeconds > 0 && (
              <Flex justify="between">
                <Text size="2">Round Timer</Text>
                <Text size="2" weight="medium">
                  {settings.roundTimerSeconds}s
                </Text>
              </Flex>
            )}
          </Flex>
        </Box>

        {cardPacks.length > 0 && (
          <Box>
            <Text size="2" color="gray" mb="2">
              Card Packs
            </Text>
            <Flex gap="2" wrap="wrap">
              {cardPacks.map((pack) => (
                <Badge key={pack.cardSetId} color="gray" size="1">
                  {pack.title}
                </Badge>
              ))}
            </Flex>
          </Box>
        )}
      </Flex>
    </Card>
  );
};
