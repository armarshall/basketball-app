import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import TeamChat from "./TeamChat";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("TeamChat Component", () => {
  const defaultProps = {
    teamId: "team123",
    userId: "user123",
    userType: "guardian",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render with empty messages", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("No messages yet. Start the conversation!")
      ).toBeTruthy();
    });
  });

  test("should display messages correctly", async () => {
    const mockMessages = [
      {
        _id: "msg1",
        teamId: "team123",
        senderId: "user456",
        senderType: "Teenager",
        content: "Hello team!",
        senderName: "John Doe",
        timestamp: new Date().toISOString(),
      },
      {
        _id: "msg2",
        teamId: "team123",
        senderId: "user123",
        senderType: "Guardian",
        content: "Hi everyone!",
        senderName: "Manager",
        timestamp: new Date().toISOString(),
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockMessages });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Hello team!")).toBeTruthy();
      expect(screen.getByText("Hi everyone!")).toBeTruthy();
      expect(screen.getByText("John Doe")).toBeTruthy();
    });
  });

  test("should distinguish own messages from others", async () => {
    const mockMessages = [
      {
        _id: "msg1",
        teamId: "team123",
        senderId: "user456",
        senderType: "Teenager",
        content: "Message from other user",
        senderName: "John Doe",
        timestamp: new Date().toISOString(),
      },
      {
        _id: "msg2",
        teamId: "team123",
        senderId: "user123",
        senderType: "Guardian",
        content: "My message",
        senderName: "Me",
        timestamp: new Date().toISOString(),
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockMessages });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Message from other user")).toBeTruthy();
      expect(screen.getByText("My message")).toBeTruthy();
    });

    // Check that sender name is shown for other users
    expect(screen.getByText("John Doe")).toBeTruthy();
  });

  test("should format timestamps correctly", async () => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const mockMessages = [
      {
        _id: "msg1",
        teamId: "team123",
        senderId: "user456",
        senderType: "Teenager",
        content: "Recent message",
        senderName: "John Doe",
        timestamp: fiveMinutesAgo.toISOString(),
      },
    ];

    mockedAxios.get.mockResolvedValue({ data: mockMessages });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/5m ago/)).toBeTruthy();
    });
  });

  test("should handle message input changes", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<TeamChat {...defaultProps} />);

    const input = (await screen.findByPlaceholderText(
      "Type your message..."
    )) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Test message" } });

    expect(input.value).toBe("Test message");
  });

  test("should send message on form submit", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    mockedAxios.post.mockResolvedValue({ data: { message: "Message sent" } });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type your message...")).toBeTruthy();
    });

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/teams/team123/messages",
        {
          userId: "user123",
          userType: "guardian",
          content: "Test message",
        }
      );
    });
  });

  test("should disable send button when input is empty", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Send")).toBeTruthy();
    });

    const sendButton = screen.getByText("Send") as HTMLButtonElement;
    expect(sendButton.disabled).toBe(true);
  });

  test("should disable send button while loading", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    let resolvePost: (value: any) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    mockedAxios.post.mockReturnValue(postPromise as any);

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type your message...")).toBeTruthy();
    });

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Sending...")).toBeTruthy();
    });

    // Resolve the promise to complete the test
    resolvePost!({ data: {} });
    await waitFor(() => {
      expect(screen.getByText("Send")).toBeTruthy();
    });
  });

  test("should clear input after successful send", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    mockedAxios.post.mockResolvedValue({ data: { message: "Message sent" } });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type your message...")).toBeTruthy();
    });

    const input = screen.getByPlaceholderText(
      "Type your message..."
    ) as HTMLInputElement;
    const sendButton = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  test("should display error state", async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 500 },
    });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Error loading messages")).toBeTruthy();
    });
  });

  test("should fetch messages on mount", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/api/teams/team123/messages",
        {
          params: { userId: "user123", userType: "guardian" },
        }
      );
    });
  });

  test("should handle send message error", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    mockedAxios.post.mockRejectedValue({
      response: { data: { error: "Send failed" } },
    });

    // Mock window.alert
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(<TeamChat {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type your message...")).toBeTruthy();
    });

    const input = screen.getByPlaceholderText("Type your message...");
    const sendButton = screen.getByText("Send");

    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Send failed");
    });

    alertMock.mockRestore();
  });
});
