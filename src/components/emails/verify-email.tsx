import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type VerifyEmailProps = {
  username: string;
  verifyUrl: string;
};

const VerifyEmail = (props: VerifyEmailProps) => {
  const { username, verifyUrl } = props;
  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[32px]">
            <Section className="mb-[32px] text-center">
              <Heading className="m-0 mb-[8px] text-[28px] font-bold text-gray-900">
                Verify Your Email Address
              </Heading>
              <Text className="m-0 text-[16px] text-gray-600">
                Complete your registration to get started
              </Text>
            </Section>

            <Section className="mb-[24px]">
              <Text className="m-0 mb-[16px] text-[16px] leading-[24px] text-gray-700">
                Hello, {username}
              </Text>
              <Text className="m-0 mb-[24px] text-[16px] leading-[24px] text-gray-700">
                Thanks for signing up! To complete your registration and secure
                your account, please verify your email address by clicking the
                button below.
              </Text>
            </Section>

            <Section className="mb-[32px] text-center">
              <Button
                className="box-border inline-block rounded-[6px] bg-gray-800 px-[32px] py-[12px] text-[16px] font-medium text-white no-underline"
                href={verifyUrl}
              >
                Verify Email Address
              </Button>
            </Section>

            <Section className="mb-[24px]">
              <Text className="m-0 mb-[8px] text-[14px] leading-[20px] text-gray-600">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Link
                className="text-[14px] break-all text-gray-700"
                href={verifyUrl}
              >
                {verifyUrl}
              </Link>
            </Section>

            <Section className="mb-[24px] rounded-[8px] bg-gray-50 p-[20px]">
              <Text className="m-0 mb-[8px] text-[14px] leading-[20px] font-semibold text-gray-700">
                Important Information:
              </Text>
              <Text className="m-0 mb-[8px] text-[14px] leading-[20px] text-gray-600">
                • This verification link will expire in 24 hours
              </Text>
              <Text className="m-0 text-[14px] leading-[20px] text-gray-600">
                • If you didn&apos;t create an account, you can safely ignore
                this email
              </Text>
            </Section>

            <Section className="mb-[24px]">
              <Text className="m-0 text-[14px] leading-[20px] text-gray-600">
                Need help? Contact our support team at{" "}
                <Link
                  className="text-gray-700"
                  href="mailto:admin@anshumanpm.in"
                >
                  admin@anshumanpm.in
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerifyEmail;
