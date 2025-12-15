import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ImageUpload from './ImageUpload';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ImageUpload Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  describe('Rendering', () => {
    it('should render component correctly', () => {
      render(<ImageUpload />);
      
      expect(screen.getByText(/Upload Sponsor Logo/i)).toBeInTheDocument();
      expect(screen.getByText(/Select an image file to upload/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Image/i)).toBeInTheDocument();
    });

    it('should have file input with correct attributes', () => {
      render(<ImageUpload />);
      
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    it('should have upload button', () => {
      render(<ImageUpload />);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      expect(uploadButton).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should allow file selection', () => {
      render(<ImageUpload />);
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files?.length).toBe(1);
    });

    it('should handle multiple file type selections', () => {
      render(<ImageUpload />);
      
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      // Test JPG
      const jpgFile = new File(['jpg'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(fileInput, 'files', {
        value: [jpgFile],
        writable: false
      });
      fireEvent.change(fileInput);
      expect(fileInput.files?.[0]).toBe(jpgFile);
      
      // Test PNG
      const pngFile = new File(['png'], 'test.png', { type: 'image/png' });
      Object.defineProperty(fileInput, 'files', {
        value: [pngFile],
        writable: false
      });
      fireEvent.change(fileInput);
      expect(fileInput.files?.[0]).toBe(pngFile);
    });
  });

  describe('Upload Functionality', () => {
    it('should show alert when no file is selected', () => {
      render(<ImageUpload />);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      expect(window.alert).toHaveBeenCalledWith('Please select a file first!');
    });

    it('should successfully upload image', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      render(<ImageUpload />);
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/images/upload',
          expect.any(FormData),
          expect.objectContaining({
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        );
      });
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Image uploaded successfully!');
      });
    });

    it('should send FormData with correct field name', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      render(<ImageUpload />);
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        const formData = mockedAxios.post.mock.calls[0][1] as FormData;
        expect(formData.get('image')).toBe(file);
      });
    });

    it('should handle upload error with error message', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { error: 'File too large' } }
      });
      
      render(<ImageUpload />);
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('File too large'));
      });
    });

    it('should handle network error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network error'));
      
      render(<ImageUpload />);
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Network error'));
      });
    });

    it('should log error to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockedAxios.post.mockRejectedValue(new Error('Test error'));
      
      render(<ImageUpload />);
      
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Upload failed:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Multiple Uploads', () => {
    it('should allow multiple consecutive uploads', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });
      
      render(<ImageUpload />);
      
      // First upload
      const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file1],
        writable: false
      });
      fireEvent.change(fileInput);
      
      let uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Image uploaded successfully!');
      });
      
      // Second upload
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
      Object.defineProperty(fileInput, 'files', {
        value: [file2],
        writable: false
      });
      fireEvent.change(fileInput);
      
      uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('File Input Edge Cases', () => {
    it('should handle file input with no files', () => {
      render(<ImageUpload />);
      
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: null,
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      expect(window.alert).toHaveBeenCalledWith('Please select a file first!');
    });

    it('should handle file input change with empty FileList', () => {
      render(<ImageUpload />);
      
      const fileInput = screen.getByRole('button', { hidden: true }).previousElementSibling as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false
      });
      
      fireEvent.change(fileInput);
      
      const uploadButton = screen.getByText(/Upload Image/i);
      fireEvent.click(uploadButton);
      
      expect(window.alert).toHaveBeenCalledWith('Please select a file first!');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ImageUpload />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(/Upload Sponsor Logo/i);
    });

    it('should have descriptive text', () => {
      render(<ImageUpload />);
      
      expect(screen.getByText(/Select an image file to upload as a sponsor logo/i)).toBeInTheDocument();
    });
  });
});

