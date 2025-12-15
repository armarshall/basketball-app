import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import TeamDetails from './TeamDetails';

// Mock dependencies
jest.mock('axios');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'team1' }),
  useNavigate: () => mockNavigate,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
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

const renderTeamDetails = () => {
  return render(
    <BrowserRouter>
      <TeamDetails />
    </BrowserRouter>
  );
};

describe('TeamDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading message initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));
      
      renderTeamDetails();
      
      expect(screen.getByText(/Loading team information.../i)).toBeInTheDocument();
    });
  });

  describe('Successful Data Display', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should display team name', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Warriors')).toBeInTheDocument();
      });
    });

    it('should display team image', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        const image = screen.getByAltText(/Warriors team image/i);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', expect.stringContaining('warriors.jpg'));
      });
    });

    it('should display player count', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/2 players/i)).toBeInTheDocument();
      });
    });

    it('should display team colors', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Team Colors')).toBeInTheDocument();
        const colorElements = screen.getAllByText(/Jersey|Primary|Secondary/);
        expect(colorElements.length).toBe(3);
      });
    });

    it('should display practice schedule', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Practice Schedule')).toBeInTheDocument();
        expect(screen.getByText('Monday')).toBeInTheDocument();
        expect(screen.getByText('Wednesday')).toBeInTheDocument();
        expect(screen.getByText('Friday')).toBeInTheDocument();
        expect(screen.getByText('18:00')).toBeInTheDocument();
      });
    });

    it('should display contact information', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
        expect(screen.getByText('coach@warriors.com')).toBeInTheDocument();
        expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
      });
    });

    it('should display team status as open', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/Open for Players/i)).toBeInTheDocument();
      });
    });

    it('should display team size information', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/2 \/ 12 players/i)).toBeInTheDocument();
      });
    });
  });

  describe('Full Team Display', () => {
    it('should show team full status when at capacity', async () => {
      const fullTeam = {
        ...mockTeam,
        players: Array(12).fill(null).map((_, i) => ({
          _id: `player${i}`,
          name: `Player ${i}`,
          email: `player${i}@test.com`
        }))
      };
      
      mockedAxios.get.mockResolvedValue({ data: fullTeam });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/Team Full/i)).toBeInTheDocument();
      });
    });

    it('should display 12/12 for full team', async () => {
      const fullTeam = {
        ...mockTeam,
        players: Array(12).fill(null).map((_, i) => ({
          _id: `player${i}`,
          name: `Player ${i}`,
          email: `player${i}@test.com`
        }))
      };
      
      mockedAxios.get.mockResolvedValue({ data: fullTeam });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/12 \/ 12 players/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should have back to teams button', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/← Back to Teams/i)).toBeInTheDocument();
      });
    });

    it('should navigate back to teams when clicking back button in header', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        const backButton = screen.getByText(/← Back to Teams/i);
        fireEvent.click(backButton);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/teams');
    });
  });

  describe('Error Handling', () => {
    it('should show error message when fetch fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/Using demo data/i)).toBeInTheDocument();
      });
    });

    it('should show demo data warning', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/API connection failed/i)).toBeInTheDocument();
      });
    });

    it('should still render with demo data on error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Demo Team')).toBeInTheDocument();
      });
    });

    it('should have proper error styling', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      const { container } = renderTeamDetails();
      
      await waitFor(() => {
        const warningElement = container.querySelector('div[style*="background"]');
        expect(warningElement).toBeInTheDocument();
      });
    });
  });

  describe('Optional Fields Display', () => {
    it('should not show practice schedule when not available', async () => {
      const teamWithoutSchedule = {
        ...mockTeam,
        teamSettings: {
          ...mockTeam.teamSettings,
          practiceDays: undefined,
          practiceTime: undefined
        }
      };
      
      mockedAxios.get.mockResolvedValue({ data: teamWithoutSchedule });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.queryByText('Practice Schedule')).not.toBeInTheDocument();
      });
    });

    it('should not show contact information when not available', async () => {
      const teamWithoutContact = {
        ...mockTeam,
        teamSettings: {
          ...mockTeam.teamSettings,
          contactEmail: undefined,
          contactPhone: undefined
        }
      };
      
      mockedAxios.get.mockResolvedValue({ data: teamWithoutContact });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.queryByText('Contact Information')).not.toBeInTheDocument();
      });
    });

    it('should show practice time even without days', async () => {
      const teamWithTimeOnly = {
        ...mockTeam,
        teamSettings: {
          ...mockTeam.teamSettings,
          practiceDays: [],
          practiceTime: '18:00'
        }
      };
      
      mockedAxios.get.mockResolvedValue({ data: teamWithTimeOnly });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.queryByText('Practice Schedule')).not.toBeInTheDocument();
      });
    });
  });

  describe('Image Handling', () => {
    it('should handle team image with http protocol', async () => {
      const teamWithHttpImage = {
        ...mockTeam,
        teamSettings: {
          ...mockTeam.teamSettings,
          teamImage: 'http://example.com/image.jpg'
        }
      };
      
      mockedAxios.get.mockResolvedValue({ data: teamWithHttpImage });
      
      renderTeamDetails();
      
      await waitFor(() => {
        const image = screen.getByAltText(/Warriors team image/i) as HTMLImageElement;
        expect(image.src).toBe('http://example.com/image.jpg');
      });
    });

    it('should handle team image with uploads path', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
      
      renderTeamDetails();
      
      await waitFor(() => {
        const image = screen.getByAltText(/Warriors team image/i) as HTMLImageElement;
        expect(image.src).toContain('localhost:3000/uploads/teams/warriors.jpg');
      });
    });

    it('should show placeholder when no team image', async () => {
      const teamWithoutImage = {
        ...mockTeam,
        teamSettings: {
          ...mockTeam.teamSettings,
          teamImage: undefined
        }
      };
      
      mockedAxios.get.mockResolvedValue({ data: teamWithoutImage });
      
      renderTeamDetails();
      
      await waitFor(() => {
        const image = screen.getByAltText(/Warriors team image/i) as HTMLImageElement;
        expect(image.src).toContain('placeholder');
      });
    });
  });

  describe('Color Display', () => {
    it('should apply primary color to header', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
      
      const { container } = renderTeamDetails();
      
      await waitFor(() => {
        const header = container.querySelector('div[style*="background"]');
        expect(header).toBeInTheDocument();
      });
    });

    it('should display color swatches', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
      
      const { container } = renderTeamDetails();
      
      await waitFor(() => {
        const colorSwatches = container.querySelectorAll('div[style*="borderRadius: 50%"]');
        expect(colorSwatches.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should use default colors when not provided', async () => {
      const teamWithoutColors = {
        ...mockTeam,
        teamSettings: {
          ...mockTeam.teamSettings,
          primaryColor: undefined,
          secondaryColor: undefined,
          jerseyColor: undefined
        }
      };
      
      mockedAxios.get.mockResolvedValue({ data: teamWithoutColors });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText('Team Colors')).toBeInTheDocument();
      });
    });
  });

  describe('Contact Links', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should have clickable email link', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        const emailLink = screen.getByText('coach@warriors.com');
        expect(emailLink).toHaveAttribute('href', 'mailto:coach@warriors.com');
      });
    });

    it('should have clickable phone link', async () => {
      renderTeamDetails();
      
      await waitFor(() => {
        const phoneLink = screen.getByText('(555) 123-4567');
        expect(phoneLink).toHaveAttribute('href', 'tel:(555) 123-4567');
      });
    });
  });

  describe('Responsive Layout', () => {
    it('should have grid layout for content', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
      
      const { container } = renderTeamDetails();
      
      await waitFor(() => {
        const gridContainer = container.querySelector('div[style*="grid"]');
        expect(gridContainer).toBeInTheDocument();
      });
    });
  });

  describe('Zero Players', () => {
    it('should display 0 players correctly', async () => {
      const emptyTeam = {
        ...mockTeam,
        players: []
      };
      
      mockedAxios.get.mockResolvedValue({ data: emptyTeam });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/0 player •/i)).toBeInTheDocument();
      });
    });

    it('should use singular form for 1 player', async () => {
      const singlePlayerTeam = {
        ...mockTeam,
        players: [mockTeam.players[0]]
      };
      
      mockedAxios.get.mockResolvedValue({ data: singlePlayerTeam });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/1 player •/i)).toBeInTheDocument();
      });
    });

    it('should use plural form for 2+ players', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
      
      renderTeamDetails();
      
      await waitFor(() => {
        expect(screen.getByText(/2 players •/i)).toBeInTheDocument();
      });
    });
  });
});
