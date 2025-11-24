// components/TeamSelection.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import TeamSelection from './TeamSelection';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock session service
jest.mock('../services/session_service', () => ({
  get_user_data: () => JSON.stringify({
    _id: 'user123',
    name: 'Test User',
    role: 'teenager'
  })
}));

// Mock TeamOverviewModal
jest.mock('./TeamOverviewModal', () => {
  return function MockTeamOverviewModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="team-overview-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

const mockTeams = [
  {
    _id: '1',
    name: 'Team Alpha',
    managerId: 'manager1',
    managerName: 'John Manager',
    playerCount: 5,
    maxPlayers: 12,
    primaryColor: '#1e40af',
    jerseyColor: '#000000'
  }
];

describe('TeamSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <TeamSelection />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading teams...')).toBeInTheDocument();
  });

  test('renders teams list when data is loaded', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: mockTeams });

    render(
      <BrowserRouter>
        <TeamSelection />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    });

    expect(screen.getByText('Managed by John Manager')).toBeInTheDocument();
    expect(screen.getByText('5 / 12')).toBeInTheDocument();
  });
});