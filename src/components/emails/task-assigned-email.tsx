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

interface TaskAssignedEmailProps {
  taskTitle: string;
  assignerName: string;
  boardName: string;
  priority: string;
  taskLink: string;
}

export const TaskAssignedEmail = ({
  taskTitle,
  assignerName,
  boardName,
  priority,
  taskLink,
}: TaskAssignedEmailProps) => {
  const previewText = `New task assigned: ${taskTitle}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Task Assigned</Heading>
          <Text style={text}>
            Hello! <strong>{assignerName}</strong> has assigned a new task to
            you in the <strong>{boardName}</strong> board.
          </Text>
          <Section style={taskCard}>
            <Text style={taskLabel}>TASK</Text>
            <Text style={taskName}>{taskTitle}</Text>
            <Text style={taskLabel}>PRIORITY</Text>
            <Text style={taskPriority}>{priority}</Text>
          </Section>
          <Section style={buttonContainer}>
            <Button style={button} href={taskLink}>
              View Task
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            CollabSpace — The modern task collaboration platform.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TaskAssignedEmail;

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

const taskCard = {
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
  padding: "20px",
  margin: "20px 0",
  border: "1px solid #e0e0e0",
};

const taskLabel = {
  color: "#888",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const taskName = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const taskPriority = {
  color: "#333",
  fontSize: "14px",
  margin: "0",
};

const buttonContainer = {
  padding: "10px 0 27px",
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
