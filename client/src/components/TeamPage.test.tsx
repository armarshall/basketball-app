import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import TeamPage from "./TeamPage";
import axios from "axios";
import * as sessionService from "../services/session_service";
import { BrowserRouter } from "react-router-dom";

// Mock dependencies
jest.mock("axios");
jest.mock("../services/session_service");
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom") as Record<string, any>;
  return {
    ...actual,
    useParams: () => ({ teamName: "test-team" }),
  };
});
jest.mock("./TeamChat", () => {
  return function MockTeamChat() {
    return <div data-testid="team-chat-mock">Team Chat Component</div>;
  };
});

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSessionService = sessionService as jest.Mocked<
  typeof sessionService
>;

describe("TeamPage Component", () => {
  const mockUser = {
    _id: "user123",
    id: "user123",
    name: "Test User",
    email: "test@example.com",
    type: "guardian",
  };

  const mockTeam = {
    _id: "team123",
    name: "Test Team",
    players: [
      { _id: "player1", name: "Player One", email: "player1@example.com" },
      { _id: "player2", name: "Player Two", email: "player2@example.com" },
    ],
    is_teen_team: true,
    managerId: "user123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test("should render loading state", () => {
    mockedSessionService.get_user_data.mockReturnValue(null);

    renderWithRouter(<TeamPage />);

    expect(screen.getByText(/Loading team data.../i)).toBeTruthy();
  });

  test("should render error state", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get.mockRejectedValue({
      response: { data: { error: "Team not found" } },
    });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeTruthy();
      expect(screen.getByText("Team not found")).toBeTruthy();
    });
  });

  test("should fetch team data by name on mount", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3000/api/teams/by-name/test-team"
      );
    });
  });

  test("should display team information", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeTruthy();
      expect(screen.getByText("Player One")).toBeTruthy();
      expect(screen.getByText("Player Two")).toBeTruthy();
    });
  });

  test("should show manager status badge", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("You are the manager of this team")).toBeTruthy();
    });
  });

  test("should show team member status badge for non-manager", async () => {
    const teenUser = {
      _id: "player1",
      id: "player1",
      name: "Player One",
      email: "player1@example.com",
      type: "teen",
    };

    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(teenUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("You are a member of this team")).toBeTruthy();
    });
  });

  test("should show add player form for managers", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Add Player to Team")).toBeTruthy();
      expect(
        screen.getByPlaceholderText("Enter player's email address")
      ).toBeTruthy();
    });
  });

  test("should not show add player form for non-managers", async () => {
    const teenUser = {
      _id: "player1",
      id: "player1",
      name: "Player One",
      email: "player1@example.com",
      type: "teen",
    };

    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(teenUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.queryByText("Add Player to Team")).toBeNull();
    });
  });

  test("should handle add player form submission", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    const updatedTeam = {
      ...mockTeam,
      players: [
        ...mockTeam.players,
        { _id: "player3", name: "Player Three", email: "player3@example.com" },
      ],
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: { message: "Player added", team: updatedTeam },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: updatedTeam });

    // Mock window.alert
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter player's email address")
      ).toBeTruthy();
    });

    const emailInput = screen.getByPlaceholderText(
      "Enter player's email address"
    );
    const addButton = screen.getByText("Add Player");

    fireEvent.change(emailInput, { target: { value: "player3@example.com" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/teams/team123/add-player",
        {
          playerEmail: "player3@example.com",
          guardianId: "user123",
        }
      );
      expect(alertMock).toHaveBeenCalledWith("Player added");
    });

    alertMock.mockRestore();
  });

  test("should handle remove player functionality", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    const updatedTeam = {
      ...mockTeam,
      players: [mockTeam.players[0]],
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: { message: "Player removed", team: updatedTeam },
    });
    mockedAxios.get.mockResolvedValueOnce({ data: updatedTeam });

    // Mock window.confirm and window.alert
    const confirmMock = jest.spyOn(window, "confirm").mockReturnValue(true);
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Remove")).toHaveLength(2);
    });

    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "http://localhost:3000/api/teams/team123/remove-player",
        {
          playerId: "player1",
          guardianId: "user123",
        }
      );
      expect(alertMock).toHaveBeenCalledWith("Player removed");
    });

    confirmMock.mockRestore();
    alertMock.mockRestore();
  });

  test("should not remove player if user cancels confirmation", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    // Mock window.confirm to return false
    const confirmMock = jest.spyOn(window, "confirm").mockReturnValue(false);

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Remove")).toHaveLength(2);
    });

    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(confirmMock).toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    confirmMock.mockRestore();
  });

  test("should show team chat only to team members", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByTestId("team-chat-mock")).toBeTruthy();
    });
  });

  test("should not show team chat to non-members", async () => {
    const nonMemberUser = {
      _id: "user456",
      id: "user456",
      name: "Non Member",
      email: "nonmember@example.com",
      type: "guardian",
    };

    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(nonMemberUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Team")).toBeTruthy();
    });

    expect(screen.queryByTestId("team-chat-mock")).toBeNull();
  });

  test("should handle manager ID as object or string", async () => {
    const teamWithObjectManagerId = {
      ...mockTeam,
      managerId: { _id: "user123" },
    };

    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: teamWithObjectManagerId })
      .mockResolvedValueOnce({ data: teamWithObjectManagerId });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("You are the manager of this team")).toBeTruthy();
    });
  });

  test("should handle API error when adding player", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: "Player not found" } },
    });

    // Mock window.alert
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Enter player's email address")
      ).toBeTruthy();
    });

    const emailInput = screen.getByPlaceholderText(
      "Enter player's email address"
    );
    const addButton = screen.getByText("Add Player");

    fireEvent.change(emailInput, { target: { value: "invalid@example.com" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Player not found");
    });

    alertMock.mockRestore();
  });

  test("should handle API error when removing player", async () => {
    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: mockTeam })
      .mockResolvedValueOnce({ data: mockTeam });

    mockedAxios.post.mockRejectedValueOnce({
      response: { data: { error: "Remove failed" } },
    });

    // Mock window.confirm and window.alert
    const confirmMock = jest.spyOn(window, "confirm").mockReturnValue(true);
    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Remove")).toHaveLength(2);
    });

    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Remove failed");
    });

    confirmMock.mockRestore();
    alertMock.mockRestore();
  });

  test("should display message when no players on team", async () => {
    const emptyTeam = { ...mockTeam, players: [] };

    mockedSessionService.get_user_data.mockReturnValue(
      JSON.stringify(mockUser)
    );
    mockedAxios.get
      .mockResolvedValueOnce({ data: emptyTeam })
      .mockResolvedValueOnce({ data: emptyTeam });

    renderWithRouter(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("No players on this team yet.")).toBeTruthy();
    });
  });
});
