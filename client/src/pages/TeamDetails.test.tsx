// pages/TeamDetails.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import TeamDetails from './TeamDetails';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useParams and useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useNavigate: () => mockNavigate,
}));

const mockTeamData = {
  _id: '123',
  name: 'Test Team',
  managerId: 'manager123',
  players: [],
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
    mockNavigate.mockClear();
  });

  test('renders loading state initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));

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

    expect(screen.getByText('0 players • 12 max')).toBeInTheDocument();
    expect(screen.getByText('Team Colors')).toBeInTheDocument();
    expect(screen.getByText('Practice Schedule')).toBeInTheDocument();
    expect(screen.getByText('Contact Information')).toBeInTheDocument();
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
  });
});