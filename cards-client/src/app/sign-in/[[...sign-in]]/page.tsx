import { SignIn } from '@clerk/nextjs';
import { Flex } from '@radix-ui/themes';

export default function SignInPage() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: '70vh' }}>
      <SignIn />
    </Flex>
  );
}
