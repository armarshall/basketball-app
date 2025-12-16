import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import TeamSelection from './TeamSelection';
import { get_user_data } from '../services/session_service';

// Mock dependencies
jest.mock('axios');
jest.mock('../services/session_service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetUserData = get_user_data as jest.MockedFunction<typeof get_user_data>;

const mockTeams = [
  {
    _id: 'team1',
    name: 'Warriors',
    managerId: 'manager1',
    managerName: 'John Doe',
    playerCount: 8,
    maxPlayers: 12,
    primaryColor: '#1e40af',
    jerseyColor: '#fbbf24',
    teamImage: '/uploads/teams/team1.jpg'
  },
  {
    _id: 'team2',
    name: 'Lakers',
    managerId: null,
    managerName: 'No Manager',
    playerCount: 10,
    maxPlayers: 12,
    primaryColor: '#7c3aed',
    jerseyColor: '#fbbf24',
    teamImage: null
  },
  {
    _id: 'team3',
    name: 'Bulls',
    managerId: 'manager2',
    managerName: 'Jane Smith',
    playerCount: 12,
    maxPlayers: 12,
    primaryColor: '#dc2626',
    jerseyColor: '#000000',
    teamImage: null
  }
];

const renderTeamSelection = () => {
  return render(
    <BrowserRouter>
      <TeamSelection />
    </BrowserRouter>
  );
};

describe('TeamSelection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockTeams });
  });

  describe('Loading and Initial Render', () => {
    it('should render loading state initially', () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      expect(screen.getByText(/Loading teams.../i)).toBeInTheDocument();
    });

    it('should display teams after loading', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText('Warriors')).toBeInTheDocument();
        expect(screen.getByText('Lakers')).toBeInTheDocument();
        expect(screen.getByText('Bulls')).toBeInTheDocument();
      });
    });

    it('should show welcome message for logged-in user', async () => {
      const mockUser = { _id: 'user1', name: 'Test User', type: 'teen' };
      mockedGetUserData.mockReturnValue(JSON.stringify(mockUser));
      
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Welcome, Test User!/i)).toBeInTheDocument();
      });
    });

    it('should display error when fetching teams fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      mockedGetUserData.mockReturnValue(null);
      
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading teams/i)).toBeInTheDocument();
      });
    });
  });

  describe('Team Display and Information', () => {
    it('should display correct team information', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText('Warriors')).toBeInTheDocument();
        expect(screen.getByText(/Managed by John Doe/i)).toBeInTheDocument();
        expect(screen.getByText('8 / 12')).toBeInTheDocument();
      });
    });

    it('should show team full status for full teams', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      await waitFor(() => {
        const fullTeamCard = screen.getByText('Bulls').closest('div');
        expect(fullTeamCard).toHaveTextContent('12 / 12');
      });
    });

    it('should display team colors correctly', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      await waitFor(() => {
        const teams = screen.getAllByText(/Warriors|Lakers|Bulls/);
        expect(teams.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Teenager User - Join as Player', () => {
    const teenUser = {
      _id: 'teen1',
      name: 'Teen User',
      email: 'teen@test.com',
      type: 'teen'
    };

    it('should show join button for teenagers', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(teenUser));
      renderTeamSelection();
      
      await waitFor(() => {
        const joinButtons = screen.getAllByText(/Join Team/i);
        expect(joinButtons.length).toBeGreaterThan(0);
      });
    });

    it('should successfully join a team as player', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(teenUser));
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      renderTeamSelection();
      
      await waitFor(() => {
        const joinButtons = screen.getAllByText(/Join Team/i);
        fireEvent.click(joinButtons[0]);
      });
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/join'),
          expect.objectContaining({ playerId: teenUser._id })
        );
      });
    });

    it('should not show join button for full teams', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(teenUser));
      renderTeamSelection();
      
      await waitFor(() => {
        const bullsCard = screen.getByText('Bulls').closest('div');
        expect(bullsCard).not.toHaveTextContent('Join Team');
      });
    });

    it('should handle join team error gracefully', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(teenUser));
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: 'Already on a team' } }
      });
      
      window.alert = jest.fn();
      
      renderTeamSelection();
      
      await waitFor(() => {
        const joinButtons = screen.getAllByText(/Join Team/i);
        fireEvent.click(joinButtons[0]);
      });
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Already on a team'));
      });
    });
  });

  describe('Guardian User - Join as Manager', () => {
    const guardianUser = {
      _id: 'guardian1',
      name: 'Guardian User',
      email: 'guardian@test.com',
      type: 'guardian',
      isManager: false,
      managedTeamId: null
    };

    it('should show join as manager button for guardians', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(guardianUser));
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Join as Manager/i)).toBeInTheDocument();
      });
    });

    it('should successfully join a team as manager', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(guardianUser));
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      mockedAxios.get.mockResolvedValueOnce({ data: mockTeams });
      mockedAxios.get.mockResolvedValueOnce({ 
        data: { ...guardianUser, isManager: true, managedTeamId: 'team2' }
      });
      
      window.alert = jest.fn();
      
      renderTeamSelection();
      
      await waitFor(() => {
        const managerButton = screen.getByText(/Join as Manager/i);
        fireEvent.click(managerButton);
      });
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/join-as-manager'),
          expect.objectContaining({
            teamId: 'team2',
            guardianId: guardianUser._id
          })
        );
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Successfully joined'));
      });
    });

    it('should not show join as manager button for teams with managers', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(guardianUser));
      renderTeamSelection();
      
      await waitFor(() => {
        const warriorsCard = screen.getByText('Warriors').closest('div');
        expect(warriorsCard).toHaveTextContent('Team already has a manager');
      });
    });

    it('should not allow managing multiple teams', async () => {
      const managerUser = { ...guardianUser, isManager: true, managedTeamId: 'team1' };
      mockedGetUserData.mockReturnValue(JSON.stringify(managerUser));
      
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/You are already managing another team/i)).toBeInTheDocument();
      });
    });

    it('should show create team button for non-manager guardians', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(guardianUser));
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Create Your Team/i)).toBeInTheDocument();
      });
    });

    it('should show manager dashboard link for managing guardians', async () => {
      const managerUser = { ...guardianUser, isManager: true, managedTeamId: 'team1' };
      mockedGetUserData.mockReturnValue(JSON.stringify(managerUser));
      
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Go to Manager Dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Team Modal Interaction', () => {
    it('should open team overview modal on team click', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      await waitFor(() => {
        const teamCard = screen.getByText('Warriors');
        fireEvent.click(teamCard.closest('div')!);
      });
      
      // Modal should open
      await waitFor(() => {
        expect(screen.getByText(/Click for team details/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no teams available', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedGetUserData.mockReturnValue(null);
      
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/No teams available/i)).toBeInTheDocument();
        expect(screen.getByText(/Check back later/i)).toBeInTheDocument();
      });
    });

    it('should show create team button in empty state for guardians', async () => {
      const guardianUser = {
        _id: 'guardian1',
        type: 'guardian',
        isManager: false
      };
      
      mockedAxios.get.mockResolvedValue({ data: [] });
      mockedGetUserData.mockReturnValue(JSON.stringify(guardianUser));
      
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Create a Team/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Authentication States', () => {
    it('should prompt login for non-authenticated users', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Please log in to join a team/i)).toBeInTheDocument();
      });
    });

    it('should show appropriate message for non-teenager/non-guardian users', async () => {
      const otherUser = { _id: 'user1', name: 'Other User' };
      mockedGetUserData.mockReturnValue(JSON.stringify(otherUser));
      
      renderTeamSelection();
      
      await waitFor(() => {
        expect(screen.getByText(/Please log in as a teenager or guardian to join/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call the correct API endpoint to fetch teams', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderTeamSelection();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/teams');
      });
    });

    it('should refresh teams after joining', async () => {
      const teenUser = { _id: 'teen1', type: 'teen' };
      mockedGetUserData.mockReturnValue(JSON.stringify(teenUser));
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      window.alert = jest.fn();
      
      renderTeamSelection();
      
      await waitFor(() => {
        const joinButtons = screen.getAllByText(/Join Team/i);
        fireEvent.click(joinButtons[0]);
      });
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Initial fetch + refresh
      });
    });
  });
});
