import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import TeamPage from './TeamPage';
import { get_user_data } from '../services/session_service';

// Mock dependencies
jest.mock('axios');
jest.mock('../services/session_service');
jest.mock('./TeamChat', () => ({
  __esModule: true,
  default: () => <div>Team Chat Component</div>
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetUserData = get_user_data as jest.MockedFunction<typeof get_user_data>;

const mockTeam = {
  _id: 'team1',
  name: 'Warriors',
  is_teen_team: true,
  managerId: 'guardian1',
  players: [
    { _id: 'player1', name: 'John Doe', email: 'john@test.com' },
    { _id: 'player2', name: 'Jane Smith', email: 'jane@test.com' }
  ]
};

const mockManager = {
  _id: 'guardian1',
  name: 'Coach Smith',
  email: 'coach@test.com',
  type: 'guardian'
};

const mockPlayer = {
  _id: 'player1',
  name: 'John Doe',
  email: 'john@test.com',
  type: 'teen'
};

const renderTeamPage = (teamName: string = 'Warriors') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/team/:teamName" element={<TeamPage />} />
      </Routes>
    </BrowserRouter>,
    { wrapper: ({ children }) => (
      <BrowserRouter>
        <Routes>
          <Route path="/team/:teamName" element={children} />
        </Routes>
      </BrowserRouter>
    )}
  );
};

describe('TeamPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  describe('Loading and Error States', () => {
    it('should show loading state initially', () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockManager));
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderTeamPage();
      
      expect(screen.getByText(/Loading team data.../i)).toBeInTheDocument();
    });

    it('should display error message on fetch failure', async () => {
      mockedGetUserData.mockReturnValue(null);
      mockedAxios.get.mockRejectedValue({
        response: { data: { error: 'Team not found' } }
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
        expect(screen.getByText(/Team not found/i)).toBeInTheDocument();
      });
    });

    it('should show try again button on error', async () => {
      mockedGetUserData.mockReturnValue(null);
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
        expect(screen.getByText(/Back to Teams/i)).toBeInTheDocument();
      });
    });

    it('should display error when team name is not provided', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockManager));
      
      render(
        <BrowserRouter>
          <TeamPage />
        </BrowserRouter>
      );
      
      await waitFor(() => {
        expect(screen.getByText(/No team specified/i)).toBeInTheDocument();
      });
    });
  });

  describe('Team Display for Non-Members', () => {
    beforeEach(() => {
      mockedGetUserData.mockReturnValue(null);
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('should display team name', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText('Warriors')).toBeInTheDocument();
      });
    });

    it('should display players list', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      });
    });

    it('should show player count', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Current Players \(2\)/i)).toBeInTheDocument();
      });
    });

    it('should not show add player form for non-managers', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.queryByText(/Add Player to Team/i)).not.toBeInTheDocument();
      });
    });

    it('should not show remove buttons for non-managers', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      });
    });

    it('should not show team chat for non-members', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.queryByText('Team Chat Component')).not.toBeInTheDocument();
      });
    });
  });

  describe('Manager View', () => {
    beforeEach(() => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockManager));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('should show manager badge', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/You are the manager of this team/i)).toBeInTheDocument();
      });
    });

    it('should display add player form for managers', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Add Player to Team/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter player's email address/i)).toBeInTheDocument();
      });
    });

    it('should show remove buttons for players', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        const removeButtons = screen.getAllByText('Remove');
        expect(removeButtons.length).toBe(2); // One for each player
      });
    });

    it('should show team chat for manager', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText('Team Chat Component')).toBeInTheDocument();
      });
    });

    it('should add player successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          message: 'Player added successfully!',
          team: mockTeam
        }
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Enter player's email address/i);
        fireEvent.change(emailInput, { target: { value: 'newplayer@test.com' } });
        
        const addButton = screen.getByText(/Add Player/i);
        fireEvent.click(addButton);
      });
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/add-player'),
          expect.objectContaining({
            playerEmail: 'newplayer@test.com',
            guardianId: mockManager._id
          })
        );
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('added successfully'));
      });
    });

    it('should try PATCH when POST fails with 404', async () => {
      mockedAxios.post.mockRejectedValue({ response: { status: 404 } });
      mockedAxios.patch.mockResolvedValue({
        data: {
          message: 'Player added successfully!',
          team: mockTeam
        }
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Enter player's email address/i);
        fireEvent.change(emailInput, { target: { value: 'newplayer@test.com' } });
        
        const addButton = screen.getByText(/Add Player/i);
        fireEvent.click(addButton);
      });
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalled();
        expect(mockedAxios.patch).toHaveBeenCalledWith(
          expect.stringContaining('/add-player'),
          expect.objectContaining({
            playerEmail: 'newplayer@test.com',
            guardianId: mockManager._id
          })
        );
      });
    });

    it('should handle add player error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: 'Player already on a team' } }
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Enter player's email address/i);
        fireEvent.change(emailInput, { target: { value: 'invalid@test.com' } });
        
        const addButton = screen.getByText(/Add Player/i);
        fireEvent.click(addButton);
      });
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('already on a team'));
      });
    });

    it('should remove player successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          message: 'Player removed successfully!',
          team: { ...mockTeam, players: [mockTeam.players[1]] }
        }
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        const removeButtons = screen.getAllByText('Remove');
        fireEvent.click(removeButtons[0]);
      });
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/remove-player'),
          expect.objectContaining({
            playerId: 'player1',
            guardianId: mockManager._id
          })
        );
      });
    });

    it('should cancel remove player on negative confirmation', async () => {
      window.confirm = jest.fn(() => false);
      
      renderTeamPage();
      
      await waitFor(() => {
        const removeButtons = screen.getAllByText('Remove');
        fireEvent.click(removeButtons[0]);
      });
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(mockedAxios.post).not.toHaveBeenCalled();
      });
    });

    it('should disable add button when loading', async () => {
      mockedAxios.post.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderTeamPage();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Enter player's email address/i);
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        
        const addButton = screen.getByText(/Add Player/i);
        fireEvent.click(addButton);
      });
      
      await waitFor(() => {
        const addButton = screen.getByText(/Adding.../i) as HTMLButtonElement;
        expect(addButton.disabled).toBe(true);
      });
    });

    it('should disable add button when email is empty', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        const addButton = screen.getByText(/Add Player/i) as HTMLButtonElement;
        expect(addButton.disabled).toBe(true);
      });
    });
  });

  describe('Player View', () => {
    beforeEach(() => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockPlayer));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('should show team member badge', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/You are a member of this team/i)).toBeInTheDocument();
      });
    });

    it('should not show add player form for players', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.queryByText(/Add Player to Team/i)).not.toBeInTheDocument();
      });
    });

    it('should not show remove buttons for players', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.queryByText('Remove')).not.toBeInTheDocument();
      });
    });

    it('should show team chat for team members', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText('Team Chat Component')).toBeInTheDocument();
      });
    });
  });

  describe('Empty Team State', () => {
    beforeEach(() => {
      const emptyTeam = { ...mockTeam, players: [] };
      mockedGetUserData.mockReturnValue(JSON.stringify(mockManager));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: emptyTeam });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: emptyTeam });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('should show empty state message', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/No players on this team yet/i)).toBeInTheDocument();
      });
    });

    it('should show player count as 0', async () => {
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/Current Players \(0\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Team Membership Detection', () => {
    it('should correctly identify manager with object managerId', async () => {
      const teamWithObjectManager = {
        ...mockTeam,
        managerId: { _id: 'guardian1', name: 'Coach Smith' } as any
      };
      
      mockedGetUserData.mockReturnValue(JSON.stringify(mockManager));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: teamWithObjectManager });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: teamWithObjectManager });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.getByText(/You are the manager of this team/i)).toBeInTheDocument();
      });
    });

    it('should not identify player as manager', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockPlayer));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        expect(screen.queryByText(/You are the manager/i)).not.toBeInTheDocument();
        expect(screen.getByText(/You are a member of this team/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch team by name', async () => {
      mockedGetUserData.mockReturnValue(null);
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/warriors')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderTeamPage('Warriors');
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/by-name/warriors')
        );
      });
    });

    it('should encode team name in URL', async () => {
      mockedGetUserData.mockReturnValue(null);
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderTeamPage('Team With Spaces');
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('team%20with%20spaces')
        );
      });
    });
  });

  describe('Unique Key Generation', () => {
    it('should generate unique keys for players with same ID', async () => {
      const duplicatePlayers = [
        { _id: 'player1', name: 'John Doe', email: 'john@test.com' },
        { _id: 'player1', name: 'John Doe', email: 'john@test.com' }
      ];
      
      const teamWithDuplicates = { ...mockTeam, players: duplicatePlayers };
      
      mockedGetUserData.mockReturnValue(null);
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/by-name/')) {
          return Promise.resolve({ data: teamWithDuplicates });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: teamWithDuplicates });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderTeamPage();
      
      await waitFor(() => {
        const johnDoeElements = screen.getAllByText('John Doe');
        expect(johnDoeElements.length).toBe(2);
      });
    });
  });
});
