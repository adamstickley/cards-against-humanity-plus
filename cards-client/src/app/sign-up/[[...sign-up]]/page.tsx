import { SignUp } from '@clerk/nextjs';
import { Flex } from '@radix-ui/themes';

export default function SignUpPage() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: '70vh' }}>
      <SignUp />
    </Flex>
  );
}
