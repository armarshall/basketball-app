import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import TeamSettings from './TeamSettings';
import { get_user_data } from '../services/session_service';

// Mock dependencies
jest.mock('axios');
jest.mock('../services/session_service');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'team1' }),
  useNavigate: () => mockNavigate,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetUserData = get_user_data as jest.MockedFunction<typeof get_user_data>;
const mockNavigate = jest.fn();

const mockGuardian = {
  _id: 'guardian1',
  name: 'Coach Smith',
  email: 'coach@test.com',
  type: 'guardian'
};

const mockTeam = {
  _id: 'team1',
  name: 'Warriors',
  managerId: 'guardian1',
  teamSettings: {
    jerseyColor: '#fbbf24',
    primaryColor: '#1e40af',
    secondaryColor: '#dc2626',
    practiceDays: ['Monday', 'Wednesday'],
    practiceTime: '18:00',
    maxPlayers: 12,
    contactEmail: 'coach@warriors.com',
    contactPhone: '(555) 123-4567',
    teamImage: '/uploads/teams/warriors.jpg'
  }
};

const renderTeamSettings = () => {
  return render(
    <BrowserRouter>
      <TeamSettings />
    </BrowserRouter>
  );
};

describe('TeamSettings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
    mockedGetUserData.mockReturnValue(JSON.stringify(mockGuardian));
  });

  describe('Loading and Error States', () => {
    it('should show loading message initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));
      
      renderTeamSettings();
      
      expect(screen.getByText(/Loading team settings.../i)).toBeInTheDocument();
    });

    it('should show error when user not logged in', async () => {
      mockedGetUserData.mockReturnValue(null);
      
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Please log in to access team settings/i)).toBeInTheDocument();
      });
    });

    it('should display error message on fetch failure', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { data: { error: 'Not authorized' } }
      });
      
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
        expect(screen.getByText(/Not authorized/i)).toBeInTheDocument();
      });
    });

    it('should have back to teams button on error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      renderTeamSettings();
      
      await waitFor(() => {
        const backButton = screen.getByText(/Back to Teams/i);
        expect(backButton).toBeInTheDocument();
      });
    });
  });

  describe('Form Display and Initialization', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should display team name in header', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Manage your team: Warriors/i)).toBeInTheDocument();
      });
    });

    it('should initialize form with existing team settings', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const emailInput = screen.getByDisplayValue('coach@warriors.com');
        expect(emailInput).toBeInTheDocument();
        
        const phoneInput = screen.getByDisplayValue('(555) 123-4567');
        expect(phoneInput).toBeInTheDocument();
      });
    });

    it('should display team image', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const image = screen.getByAltText(/Warriors team image/i);
        expect(image).toBeInTheDocument();
      });
    });

    it('should show color inputs with correct values', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText('#fbbf24')).toBeInTheDocument();
        expect(screen.getByText('#1e40af')).toBeInTheDocument();
        expect(screen.getByText('#dc2626')).toBeInTheDocument();
      });
    });

    it('should show practice days as checked', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const mondayCheckbox = screen.getByLabelText(/Monday/i) as HTMLInputElement;
        const wednesdayCheckbox = screen.getByLabelText(/Wednesday/i) as HTMLInputElement;
        
        expect(mondayCheckbox.checked).toBe(true);
        expect(wednesdayCheckbox.checked).toBe(true);
      });
    });

    it('should show max players input', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const maxPlayersInput = screen.getByDisplayValue('12');
        expect(maxPlayersInput).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should update contact email on change', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('team@example.com');
        fireEvent.change(emailInput, { target: { value: 'new@email.com' } });
        expect(emailInput).toHaveValue('new@email.com');
      });
    });

    it('should update contact phone on change', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const phoneInput = screen.getByPlaceholderText('(555) 123-4567');
        fireEvent.change(phoneInput, { target: { value: '(555) 999-8888' } });
        expect(phoneInput).toHaveValue('(555) 999-8888');
      });
    });

    it('should update max players on change', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const maxPlayersInput = screen.getByLabelText(/Maximum Players/i);
        fireEvent.change(maxPlayersInput, { target: { value: '15' } });
        expect(maxPlayersInput).toHaveValue(15);
      });
    });

    it('should toggle practice days', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const tuesdayCheckbox = screen.getByLabelText(/Tuesday/i) as HTMLInputElement;
        expect(tuesdayCheckbox.checked).toBe(false);
        
        fireEvent.click(tuesdayCheckbox);
        expect(tuesdayCheckbox.checked).toBe(true);
      });
    });

    it('should uncheck already selected practice day', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const mondayCheckbox = screen.getByLabelText(/Monday/i) as HTMLInputElement;
        expect(mondayCheckbox.checked).toBe(true);
        
        fireEvent.click(mondayCheckbox);
        expect(mondayCheckbox.checked).toBe(false);
      });
    });

    it('should update practice time', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const timeInput = screen.getByLabelText(/Practice Time/i);
        fireEvent.change(timeInput, { target: { value: '19:00' } });
        expect(timeInput).toHaveValue('19:00');
      });
    });
  });

  describe('Save Settings', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should save settings successfully', async () => {
      mockedAxios.put.mockResolvedValue({ data: { success: true } });
      
      renderTeamSettings();
      
      await waitFor(() => {
        const saveButton = screen.getByText(/Save Settings/i);
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          expect.stringContaining('/settings'),
          expect.objectContaining({
            settings: expect.any(Object),
            guardianId: mockGuardian._id
          })
        );
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('updated successfully'));
      });
    });

    it('should disable save button while saving', async () => {
      mockedAxios.put.mockImplementation(() => new Promise(() => {}));
      
      renderTeamSettings();
      
      await waitFor(() => {
        const saveButton = screen.getByText(/Save Settings/i);
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        const savingButton = screen.getByText(/Saving.../i) as HTMLButtonElement;
        expect(savingButton.disabled).toBe(true);
      });
    });

    it('should handle save error', async () => {
      mockedAxios.put.mockRejectedValue({
        response: { data: { error: 'Unauthorized' } }
      });
      
      renderTeamSettings();
      
      await waitFor(() => {
        const saveButton = screen.getByText(/Save Settings/i);
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Unauthorized'));
      });
    });

    it('should refresh team data after successful save', async () => {
      mockedAxios.put.mockResolvedValue({ data: { success: true } });
      
      renderTeamSettings();
      
      await waitFor(() => {
        const saveButton = screen.getByText(/Save Settings/i);
        fireEvent.click(saveButton);
      });
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(2); // Initial + refresh
      });
    });
  });

  describe('Image Upload', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should have upload image button', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Upload New Image/i)).toBeInTheDocument();
      });
    });

    it('should upload image successfully', async () => {
      mockedAxios.post.mockResolvedValue({ 
        data: { 
          imageUrl: '/uploads/teams/new-image.jpg',
          success: true 
        } 
      });
      
      renderTeamSettings();
      
      await waitFor(() => {
        const fileInput = screen.getByLabelText(/Upload New Image/i).previousElementSibling as HTMLInputElement;
        const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
        
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false
        });
        
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.stringContaining('/upload-image'),
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        );
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('updated successfully'));
      });
    });

    it('should handle image upload error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: 'File too large' } }
      });
      
      renderTeamSettings();
      
      await waitFor(() => {
        const fileInput = screen.getByLabelText(/Upload New Image/i).previousElementSibling as HTMLInputElement;
        const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
        
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false
        });
        
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('File too large'));
      });
    });

    it('should send correct FormData for image upload', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      renderTeamSettings();
      
      await waitFor(() => {
        const fileInput = screen.getByLabelText(/Upload New Image/i).previousElementSibling as HTMLInputElement;
        const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
        
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false
        });
        
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        const formData = mockedAxios.post.mock.calls[0][1] as FormData;
        expect(formData.get('teamImage')).toBe(file);
        expect(formData.get('guardianId')).toBe(mockGuardian._id);
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should navigate to team page', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const viewButton = screen.getByText(/View Team Page/i);
        fireEvent.click(viewButton);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/team/team1');
    });

    it('should navigate to manager profile', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const managerButtons = screen.getAllByText(/Manager Profile/i);
        fireEvent.click(managerButtons[0]);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/manager-profile');
    });

    it('should navigate to manager profile on cancel', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const cancelButton = screen.getByText(/Cancel/i);
        fireEvent.click(cancelButton);
      });
      
      expect(mockNavigate).toHaveBeenCalledWith('/manager-profile');
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should have manage players button', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Manage Players/i)).toBeInTheDocument();
      });
    });

    it('should have view public page button', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/View Public Page/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should validate max players range', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const maxPlayersInput = screen.getByLabelText(/Maximum Players/i) as HTMLInputElement;
        expect(maxPlayersInput.min).toBe('1');
        expect(maxPlayersInput.max).toBe('20');
      });
    });

    it('should have email type for contact email', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText('team@example.com');
        expect(emailInput).toHaveAttribute('type', 'email');
      });
    });

    it('should have tel type for contact phone', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        const phoneInput = screen.getByPlaceholderText('(555) 123-4567');
        expect(phoneInput).toHaveAttribute('type', 'tel');
      });
    });
  });

  describe('All Practice Days', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should display all days of the week', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Monday/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Tuesday/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Wednesday/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Thursday/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Friday/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Saturday/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Sunday/i)).toBeInTheDocument();
      });
    });
  });

  describe('Color Picker Display', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockTeam });
    });

    it('should show jersey color label', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Jersey Color/i)).toBeInTheDocument();
      });
    });

    it('should show primary color label', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Primary Color/i)).toBeInTheDocument();
      });
    });

    it('should show secondary color label', async () => {
      renderTeamSettings();
      
      await waitFor(() => {
        expect(screen.getByText(/Secondary Color/i)).toBeInTheDocument();
      });
    });
  });
});
