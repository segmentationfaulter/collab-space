import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface InvitationEmailProps {
  workspaceName: string;
  inviterName: string;
  invitationLink: string;
}

export const InvitationEmail = ({
  workspaceName,
  inviterName,
  invitationLink,
}: InvitationEmailProps) => {
  const previewText = `Join ${workspaceName} on CollabSpace`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Workspace Invitation</Heading>
          <Text style={text}>
            Hello! <strong>{inviterName}</strong> has invited you to join the{" "}
            <strong>{workspaceName}</strong> workspace on CollabSpace.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={invitationLink}>
              Join Workspace
            </Button>
          </Section>
          <Text style={text}>
            If you were not expecting this invitation, you can safely ignore
            this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            CollabSpace — The modern task collaboration platform.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default InvitationEmail;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  padding: "17px 0 0",
  margin: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "16px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
};
