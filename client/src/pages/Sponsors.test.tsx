import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import Sponsors from './Sponsors';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockSponsorImages = [
  {
    _id: '1',
    filename: 'nike-logo.png',
    url: '/uploads/nike-logo.png',
    uploadDate: '2024-01-15T10:00:00.000Z'
  },
  {
    _id: '2',
    filename: 'gatorade-logo.png',
    url: 'http://localhost:3000/uploads/gatorade-logo.png',
    uploadDate: '2024-01-16T10:00:00.000Z'
  },
  {
    _id: '3',
    filename: 'wilson-basketball.png',
    url: '/uploads/wilson-basketball.png',
    uploadDate: '2024-01-17T10:00:00.000Z'
  }
];

describe('Sponsors Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading message initially', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<Sponsors />);
      
      expect(screen.getByText(/Loading sponsors.../i)).toBeInTheDocument();
    });

    it('should have correct loading styles', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {}));
      
      render(<Sponsors />);
      
      const loadingDiv = screen.getByText(/Loading sponsors.../i).parentElement;
      expect(loadingDiv).toHaveStyle({ padding: '40px', textAlign: 'center' });
    });
  });

  describe('Successful Data Fetching', () => {
    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: mockSponsorImages });
    });

    it('should render sponsors page heading', async () => {
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Our Sponsors/i)).toBeInTheDocument();
      });
    });

    it('should display thank you message', async () => {
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Thank you to our amazing sponsors/i)).toBeInTheDocument();
      });
    });

    it('should display all sponsor images', async () => {
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByAltText(/Nike logo/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Gatorade logo/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Wilson logo/i)).toBeInTheDocument();
      });
    });

    it('should display sponsor names correctly', async () => {
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText('Nike')).toBeInTheDocument();
        expect(screen.getByText('Gatorade')).toBeInTheDocument();
        expect(screen.getByText('Wilson')).toBeInTheDocument();
      });
    });

    it('should display Official Partner label', async () => {
      render(<Sponsors />);
      
      await waitFor(() => {
        const partnerLabels = screen.getAllByText(/Official Partner/i);
        expect(partnerLabels.length).toBe(3);
      });
    });

    it('should display upload dates', async () => {
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Added:.*1\/15\/2024/i)).toBeInTheDocument();
        expect(screen.getByText(/Added:.*1\/16\/2024/i)).toBeInTheDocument();
        expect(screen.getByText(/Added:.*1\/17\/2024/i)).toBeInTheDocument();
      });
    });

    it('should fetch from sponsor-specific endpoint', async () => {
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/images/sponsors');
      });
    });
  });

  describe('Image URL Handling', () => {
    it('should handle relative URLs correctly', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[0]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        const image = screen.getByAltText(/Nike logo/i) as HTMLImageElement;
        expect(image.src).toContain('http://localhost:3000/uploads/nike-logo.png');
      });
    });

    it('should handle absolute URLs correctly', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[1]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        const image = screen.getByAltText(/Gatorade logo/i) as HTMLImageElement;
        expect(image.src).toBe('http://localhost:3000/uploads/gatorade-logo.png');
      });
    });

    it('should handle image load error with fallback', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[0]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        const image = screen.getByAltText(/Nike logo/i);
        fireEvent.error(image);
        
        // Should have attempted to load image
        expect(image).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show message when no sponsors found', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/No sponsor images found/i)).toBeInTheDocument();
        expect(screen.getByText(/Check if sponsor images exist in your database/i)).toBeInTheDocument();
      });
    });

    it('should still show heading when no sponsors', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Our Sponsors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load sponsors/i)).toBeInTheDocument();
      });
    });

    it('should show try again button on error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });
    });

    it('should retry fetching when try again is clicked', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      mockedAxios.get.mockResolvedValueOnce({ data: mockSponsorImages });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });
      
      const tryAgainButton = screen.getByText(/Try Again/i);
      fireEvent.click(tryAgainButton);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(3); // Initial + fallback + retry
        expect(screen.getByText('Nike')).toBeInTheDocument();
      });
    });

    it('should fallback to general images endpoint on sponsor endpoint failure', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Sponsor endpoint error'))
        .mockResolvedValueOnce({ data: mockSponsorImages });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/images/sponsors');
        expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3000/api/images');
      });
      
      await waitFor(() => {
        expect(screen.getByText('Nike')).toBeInTheDocument();
      });
    });

    it('should handle both endpoints failing', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to load sponsors/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sponsor Name Mapping', () => {
    it('should recognize Nike sponsor', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[0]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText('Nike')).toBeInTheDocument();
      });
    });

    it('should recognize Gatorade sponsor', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[1]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText('Gatorade')).toBeInTheDocument();
      });
    });

    it('should recognize Wilson sponsor', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[2]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText('Wilson')).toBeInTheDocument();
      });
    });

    it('should handle unknown sponsor with cleaned filename', async () => {
      const unknownSponsor = {
        _id: '4',
        filename: '123-custom-sponsor-logo.png',
        url: '/uploads/custom.png',
        uploadDate: '2024-01-18T10:00:00.000Z'
      };
      
      mockedAxios.get.mockResolvedValue({ data: [unknownSponsor] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText('Custom Sponsor')).toBeInTheDocument();
      });
    });

    it('should handle Baltimore city sponsor', async () => {
      const baltimoreSponsor = {
        _id: '5',
        filename: 'baltimore-city-logo.png',
        url: '/uploads/baltimore.png',
        uploadDate: '2024-01-19T10:00:00.000Z'
      };
      
      mockedAxios.get.mockResolvedValue({ data: [baltimoreSponsor] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText('Baltimore City')).toBeInTheDocument();
      });
    });

    it('should fallback to "Sponsor" for empty filename', async () => {
      const emptySponsor = {
        _id: '6',
        filename: '',
        url: '/uploads/empty.png',
        uploadDate: '2024-01-20T10:00:00.000Z'
      };
      
      mockedAxios.get.mockResolvedValue({ data: [emptySponsor] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        expect(screen.getByText('Sponsor')).toBeInTheDocument();
      });
    });
  });

  describe('Styling and Layout', () => {
    it('should display sponsors in flex layout', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSponsorImages });
      
      const { container } = render(<Sponsors />);
      
      await waitFor(() => {
        const sponsorContainer = container.querySelector('div[style*="display: flex"]');
        expect(sponsorContainer).toBeInTheDocument();
      });
    });

    it('should have proper image styles', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[0]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        const image = screen.getByAltText(/Nike logo/i);
        expect(image).toHaveStyle({
          width: '200px',
          height: '200px',
          objectFit: 'contain'
        });
      });
    });

    it('should have card styling for each sponsor', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[0]] });
      
      const { container } = render(<Sponsors />);
      
      await waitFor(() => {
        const sponsorCard = container.querySelector('div[style*="border: 1px solid"]');
        expect(sponsorCard).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', async () => {
      mockedAxios.get.mockResolvedValue({ data: [mockSponsorImages[0]] });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        const dateText = screen.getByText(/Added:/i);
        expect(dateText).toBeInTheDocument();
        // Date format depends on locale, just check it exists
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSponsorImages });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        const mainHeading = screen.getByRole('heading', { level: 1 });
        expect(mainHeading).toHaveTextContent(/Our Sponsors/i);
      });
    });

    it('should have alt text for all images', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockSponsorImages });
      
      render(<Sponsors />);
      
      await waitFor(() => {
        const images = screen.getAllByRole('img');
        images.forEach(img => {
          expect(img).toHaveAttribute('alt');
          expect(img.getAttribute('alt')).not.toBe('');
        });
      });
    });
  });
});

