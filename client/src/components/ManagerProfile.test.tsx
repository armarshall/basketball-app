import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import ManagerProfile from './ManagerProfile';
import { get_user_data } from '../services/session_service';

// Mock dependencies
jest.mock('axios');
jest.mock('../services/session_service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetUserData = get_user_data as jest.MockedFunction<typeof get_user_data>;
const mockNavigate = jest.fn();

const mockTeam = {
  _id: 'team1',
  name: 'Warriors',
  managerId: 'guardian1',
  players: [
    { _id: 'player1', name: 'John Doe', email: 'john@test.com' },
    { _id: 'player2', name: 'Jane Smith', email: 'jane@test.com' }
  ],
  teamSettings: {
    teamImage: '/uploads/teams/warriors.jpg',
    jerseyColor: '#fbbf24',
    primaryColor: '#1e40af',
    secondaryColor: '#dc2626',
    practiceDays: ['Monday', 'Wednesday', 'Friday'],
    practiceTime: '18:00',
    maxPlayers: 12,
    contactEmail: 'coach@warriors.com',
    contactPhone: '(555) 123-4567'
  }
};

const mockGuardian = {
  _id: 'guardian1',
  name: 'Coach Smith',
  email: 'coach@test.com',
  type: 'guardian',
  isManager: true,
  managedTeamId: 'team1'
};

const renderManagerProfile = () => {
  return render(
    <BrowserRouter>
      <ManagerProfile />
    </BrowserRouter>
  );
};

describe('ManagerProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    window.confirm = jest.fn(() => true);
  });

  describe('Loading and Initial State', () => {
    it('should show loading state initially', () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
      renderManagerProfile();
      
      expect(screen.getByText(/Loading manager profile.../i)).toBeInTheDocument();
    });

    it('should prompt login for non-authenticated users', async () => {
      mockedGetUserData.mockReturnValue(null);
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Please log in to access manager profile/i)).toBeInTheDocument();
      });
    });

    it('should show message for non-manager users', async () => {
      const nonManager = { ...mockGuardian, isManager: false, managedTeamId: null };
      mockedGetUserData.mockReturnValue(JSON.stringify(nonManager));
      mockedAxios.get.mockResolvedValue({ data: nonManager });
      
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/You are not currently managing any team/i)).toBeInTheDocument();
        expect(screen.getByText(/Browse Available Teams/i)).toBeInTheDocument();
      });
    });
  });

  describe('Manager Dashboard Display', () => {
    beforeEach(() => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/guardians/email/')) {
          return Promise.resolve({ data: mockGuardian });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/players')) {
          return Promise.resolve({ data: mockTeam.players });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('should display manager welcome message', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Manager Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Welcome back, Coach Smith!/i)).toBeInTheDocument();
      });
    });

    it('should display team overview information', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText('Warriors')).toBeInTheDocument();
        expect(screen.getByText(/2 \/ 12/i)).toBeInTheDocument();
      });
    });

    it('should display team colors', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        const jerseyColor = screen.getByText('#fbbf24');
        expect(jerseyColor).toBeInTheDocument();
      });
    });

    it('should display practice schedule', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Wednesday')).toBeInTheDocument();
        expect(screen.getByText('Friday')).toBeInTheDocument();
        expect(screen.getByText('18:00')).toBeInTheDocument();
      });
    });

    it('should display team image', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        const image = screen.getByAltText(/Warriors team image/i);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', expect.stringContaining('warriors.jpg'));
      });
    });
  });

  describe('Player Management', () => {
    beforeEach(() => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/guardians/email/')) {
          return Promise.resolve({ data: mockGuardian });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/players')) {
          return Promise.resolve({ data: mockTeam.players });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('should display player roster', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      });
    });

    it('should show correct player count', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/2 player/i)).toBeInTheDocument();
      });
    });

    it('should add player successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          message: 'Player added successfully!',
          team: mockTeam
        }
      });
      
      renderManagerProfile();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Enter player's email address/i);
        fireEvent.change(emailInput, { target: { value: 'newplayer@test.com' } });
        
        const addButton = screen.getByText(/Send Invite/i);
        fireEvent.click(addButton);
      });
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/add-player'),
          expect.objectContaining({
            playerEmail: 'newplayer@test.com',
            guardianId: mockGuardian._id
          })
        );
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Player added'));
      });
    });

    it('should handle add player error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: 'Player not found' } }
      });
      
      renderManagerProfile();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/Enter player's email address/i);
        fireEvent.change(emailInput, { target: { value: 'invalid@test.com' } });
        
        const addButton = screen.getByText(/Send Invite/i);
        fireEvent.click(addButton);
      });
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Player not found'));
      });
    });

    it('should remove player successfully', async () => {
      mockedAxios.post.mockResolvedValue({
        data: {
          message: 'Player removed successfully!',
          team: { ...mockTeam, players: [mockTeam.players[1]] }
        }
      });
      
      renderManagerProfile();
      
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
            guardianId: mockGuardian._id
          })
        );
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('removed successfully'));
      });
    });

    it('should cancel player removal on negative confirmation', async () => {
      window.confirm = jest.fn(() => false);
      
      renderManagerProfile();
      
      await waitFor(() => {
        const removeButtons = screen.getAllByText('Remove');
        fireEvent.click(removeButtons[0]);
      });
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(mockedAxios.post).not.toHaveBeenCalled();
      });
    });

    it('should disable add button when email is empty', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        const addButton = screen.getByText(/Send Invite/i) as HTMLButtonElement;
        expect(addButton.disabled).toBe(true);
      });
    });

    it('should show empty state when no players', async () => {
      const emptyTeam = { ...mockTeam, players: [] };
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/guardians/email/')) {
          return Promise.resolve({ data: mockGuardian });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: emptyTeam });
        }
        if (url.includes('/players')) {
          return Promise.resolve({ data: [] });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/No players on the team yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation and Actions', () => {
    beforeEach(() => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/guardians/email/')) {
          return Promise.resolve({ data: mockGuardian });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/players')) {
          return Promise.resolve({ data: mockTeam.players });
        }
        return Promise.resolve({ data: {} });
      });
    });

    it('should navigate to team settings', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        const settingsButtons = screen.getAllByText('Team Settings');
        fireEvent.click(settingsButtons[0]);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/team/team1/settings');
    });

    it('should navigate to public team page', async () => {
      renderManagerProfile();
      
      await waitFor(() => {
        const publicPageButton = screen.getByText('View Public Team Page');
        fireEvent.click(publicPageButton);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/team/team1');
    });

    it('should handle leave team action', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      renderManagerProfile();
      
      await waitFor(() => {
        const leaveButton = screen.getByText('Leave Team as Manager');
        fireEvent.click(leaveButton);
      });
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/leave-as-manager'),
          expect.objectContaining({
            teamId: 'team1',
            guardianId: mockGuardian._id
          })
        );
      });
    });

    it('should cancel leave team on negative confirmation', async () => {
      window.confirm = jest.fn(() => false);
      
      renderManagerProfile();
      
      await waitFor(() => {
        const leaveButton = screen.getByText('Leave Team as Manager');
        fireEvent.click(leaveButton);
      });
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(mockedAxios.post).not.toHaveBeenCalled();
      });
    });
  });

  describe('Fresh Data Loading', () => {
    it('should fetch fresh guardian data on mount', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/guardians/email/')) {
          return Promise.resolve({ data: mockGuardian });
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/players')) {
          return Promise.resolve({ data: mockTeam.players });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderManagerProfile();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining('/guardians/email/')
        );
      });
    });

    it('should update session storage with fresh data', async () => {
      const outdatedGuardian = { ...mockGuardian, isManager: false };
      mockedGetUserData.mockReturnValue(JSON.stringify(outdatedGuardian));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/guardians/email/')) {
          return Promise.resolve({ data: mockGuardian }); // Fresh data with isManager: true
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/players')) {
          return Promise.resolve({ data: mockTeam.players });
        }
        return Promise.resolve({ data: {} });
      });
      
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
      
      renderManagerProfile();
      
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith(
          'user',
          expect.stringContaining('"isManager":true')
        );
      });
      
      setItemSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      renderManagerProfile();
      
      await waitFor(() => {
        // Should still show something, even if data fetch fails
        expect(screen.getByText(/Manager Dashboard/i)).toBeInTheDocument();
      });
    });

    it('should fallback to cached data when fresh data fetch fails', async () => {
      mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/guardians/email/')) {
          return Promise.reject(new Error('Network error'));
        }
        if (url.includes('/manage')) {
          return Promise.resolve({ data: mockTeam });
        }
        if (url.includes('/players')) {
          return Promise.resolve({ data: mockTeam.players });
        }
        return Promise.resolve({ data: {} });
      });
      
      renderManagerProfile();
      
      await waitFor(() => {
        // Should still render with cached guardian data
        expect(screen.getByText(/Manager Dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Non-Manager States', () => {
    it('should show browse teams and create team buttons for non-managers', async () => {
      const nonManager = { ...mockGuardian, isManager: false, managedTeamId: null };
      mockedGetUserData.mockReturnValue(JSON.stringify(nonManager));
      mockedAxios.get.mockResolvedValue({ data: nonManager });
      
      renderManagerProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Browse Available Teams/i)).toBeInTheDocument();
        expect(screen.getByText(/Create a Team/i)).toBeInTheDocument();
      });
    });

    it('should navigate to teams page when clicking browse button', async () => {
      const nonManager = { ...mockGuardian, isManager: false, managedTeamId: null };
      mockedGetUserData.mockReturnValue(JSON.stringify(nonManager));
      mockedAxios.get.mockResolvedValue({ data: nonManager });
      
      renderManagerProfile();
      
      await waitFor(() => {
        const browseButton = screen.getByText(/Browse Available Teams/i);
        fireEvent.click(browseButton);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/teams');
    });

    it('should navigate to team creation when clicking create button', async () => {
      const nonManager = { ...mockGuardian, isManager: false, managedTeamId: null };
      mockedGetUserData.mockReturnValue(JSON.stringify(nonManager));
      mockedAxios.get.mockResolvedValue({ data: nonManager });
      
      renderManagerProfile();
      
      await waitFor(() => {
        const createButton = screen.getByText(/Create a Team/i);
        fireEvent.click(createButton);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/teamcreate');
    });
  });
});

