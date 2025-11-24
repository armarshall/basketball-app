// pages/TeamDetails.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import TeamDetails from './TeamDetails';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useParams and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useNavigate: () => jest.fn(),
}));

const mockTeamData = {
  _id: '123',
  name: 'Test Team',
  managerId: 'manager123',
  players: [
    { _id: 'player1', name: 'John Doe', email: 'john@test.com' },
    { _id: 'player2', name: 'Jane Smith', email: 'jane@test.com' }
  ],
  teamSettings: {
    teamImage: '/uploads/team-image.jpg',
    jerseyColor: '#000000',
    primaryColor: '#1e40af',
    secondaryColor: '#dc2626',
    practiceDays: ['Monday', 'Wednesday'],
    practiceTime: '18:00',
    maxPlayers: 12,
    contactEmail: 'team@test.com',
    contactPhone: '(555) 123-4567'
  }
};

describe('TeamDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <BrowserRouter>
        <TeamDetails />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading team information...')).toBeInTheDocument();
  });

  test('renders team details when data is fetched successfully', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTeamData });

    render(
      <BrowserRouter>
        <TeamDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Team')).toBeInTheDocument();
    });

    expect(screen.getByText('2 players • 12 max')).toBeInTheDocument();
    expect(screen.getByText('Team Colors')).toBeInTheDocument();
    expect(screen.getByText('Practice Schedule')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
    expect(screen.getByText('team@test.com')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
  });

  test('renders error state when API call fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    render(
      <BrowserRouter>
        <TeamDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Using demo data - API connection failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Demo Team')).toBeInTheDocument();
  });

  test('renders team colors correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTeamData });

    render(
      <BrowserRouter>
        <TeamDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Jersey')).toBeInTheDocument();
    });

    const jerseyColorElement = screen.getByTitle('Jersey Color');
    expect(jerseyColorElement).toBeInTheDocument();
  });

  test('renders practice days correctly', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTeamData });

    render(
      <BrowserRouter>
        <TeamDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Monday')).toBeInTheDocument();
      expect(screen.getByText('Wednesday')).toBeInTheDocument();
    });
  });

  test('handles missing team settings gracefully', async () => {
    const teamWithoutSettings = {
      ...mockTeamData,
      teamSettings: undefined
    };
    mockedAxios.get.mockResolvedValueOnce({ data: teamWithoutSettings });

    render(
      <BrowserRouter>
        <TeamDetails />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Team')).toBeInTheDocument();
    });

    // Should still render with default values
    expect(screen.getByText('Team Colors')).toBeInTheDocument();
  });
});